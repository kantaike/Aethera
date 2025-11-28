using System;
using System.Collections.Generic;
using System.Linq;
using Aethera.Domain.Entities.Basic;
using Aethera.Domain.Entities.Characters;

namespace Aethera.Domain.Services
{
    /// <summary>
    /// Service that encapsulates D&D-style level up logic.
    /// Use InitializeForNewCharacter for freshly-created characters (sets hit die, level‑1 HP, and class saves).
    /// Use LevelUpCharacter to increase level(s) — HP is recalculated according to D&D rules,
    /// ability score improvements (ASI) are applied automatically by choosing the highest attribute,
    /// and HP gains may be rolled or averaged.
    /// </summary>
    public static class LevelUpService
    {
        // ASI levels in D&D 5e
        private static readonly int[] AsiLevels = { 4, 8, 12, 16, 19 };

        /// <summary>
        /// Initialize a newly-created character according to their class and race:
        /// - assigns proper hit die for the class
        /// - sets level 1 HP to (hit die max + CON modifier) (minimum 1)
        /// - adds class saving throw proficiencies
        /// (params) character
        /// </summary>
        public static void InitializeForNewCharacter(Character character)
        {
            if (character is null) throw new ArgumentNullException(nameof(character));

            if (character.Class is null) return; // nothing to initialize for no-class characters

            var hitDie = GetHitDieForClass(character.Class.Value);
            character.UpdateHitDice(hitDie);

            var conMod = character.Constitution?.Modifier ?? 0;
            var maxHp = Math.Max(hitDie.Sides + conMod, 1);
            character.UpdateHitPoints(maxHp, maxHp);

            // Add standard class saving throw proficiencies
            var saves = GetSavingThrowNamesForClass(character.Class.Value);
            foreach (var save in saves)
            {
                character.AddSavingThrowProficiency(save);
            }
        }

        /// <summary>
        /// Level up the character by given number of levels.
        /// - Ensures HitDice present for class
        /// - Advances Character.Level via Character.LevelUp
        /// - Recalculates total Max HP according to D&D rules:
        ///   level 1: max hit die + CON modifier
        ///   each subsequent level: roll hit die or use average ((sides/2)+1) + CON modifier (min 1 per level)
        /// - Applies ability score improvements (ASI) automatically at ASI levels by adding +2 to the highest attribute.
        /// (params) character, levels (count), rollHp (true -> roll each level; false -> use average)
        /// </summary>
        public static void LevelUpCharacter(Character character, int levels = 1, bool rollHp = false)
        {
            if (character is null) throw new ArgumentNullException(nameof(character));
            if (levels < 1) throw new ArgumentOutOfRangeException(nameof(levels));

            // Ensure hit die is assigned
            if (character.HitDice is null)
            {
                if (character.Class is null)
                {
                    // No class - default to d8 to be safe
                    character.UpdateHitDice(new D8());
                }
                else
                {
                    character.UpdateHitDice(GetHitDieForClass(character.Class.Value));
                }
            }

            var hitDie = character.HitDice ?? GetHitDieForClass(character.Class ?? CharacterClass.Fighter);
            var conMod = character.Constitution?.Modifier ?? 0;

            // record old and new levels for ASI detection
            var oldLevel = character.Level;
            // Use Character.LevelUp to actually increment Level (it will update HP using its internal average logic,
            // but we'll overwrite HP below with correct D&D calculation).
            character.LevelUp(levels);
            var newLevel = character.Level;

            // Compute desired total max HP following D&D rules
            var desiredMaxHp = 0;

            // Level 1 HP
            if (newLevel >= 1)
            {
                desiredMaxHp = Math.Max(hitDie.Sides + conMod, 1);
            }

            // Levels 2..newLevel HP additions
            var rng = new Random();
            for (int lvl = 2; lvl <= newLevel; lvl++)
            {
                int hpGain;
                if (rollHp)
                {
                    // roll using a fresh die of correct sides (Dice.Roll is available on hitDie)
                    // use hitDie.Roll() if available; hitDie may be shared instance, but Roll is stateless/random.
                    hpGain = hitDie.Roll() + conMod;
                }
                else
                {
                    hpGain = (hitDie.Sides / 2) + 1 + conMod;
                }

                // Minimum 1 HP gained per level
                if (hpGain < 1) hpGain = 1;

                desiredMaxHp += hpGain;
            }

            // Preserve temp HP if was present
            var temp = character.HP?.Temp;

            // Set both Max and Current to the desired max after leveling
            character.UpdateHitPoints(desiredMaxHp, desiredMaxHp, temp);

            // Apply Ability Score Improvements for each ASI level crossed
            ApplyAsiIfNeeded(character, oldLevel, newLevel);
        }

        private static void ApplyAsiIfNeeded(Character character, int oldLevel, int newLevel)
        {
            // For every ASI level that was crossed (oldLevel < level <= newLevel) apply a +2 to the highest attribute.
            var crossed = AsiLevels.Where(l => l > oldLevel && l <= newLevel).ToArray();
            if (crossed.Length == 0) return;

            foreach (var _ in crossed)
            {
                // Choose highest attribute by Score. Tie-breaker: Str, Dex, Con, Int, Wis, Cha (stable order).
                var attributes = new (string name, int score)[]
                {
                    ("strength", character.Strength?.Score ?? 10),
                    ("dexterity", character.Dexterity?.Score ?? 10),
                    ("constitution", character.Constitution?.Score ?? 10),
                    ("intelligence", character.Intelligence?.Score ?? 10),
                    ("wisdom", character.Wisdom?.Score ?? 10),
                    ("charisma", character.Charisma?.Score ?? 10)
                };
                (string name,int score) targetAttribute;
                int i = 0;
                do
                {
                    targetAttribute = attributes.OrderByDescending(a => a.score)
                                        .ThenBy(a => GetAttributePriority(a.name))
                                        .Skip(i).First();
                    i++;
                } while (targetAttribute.score > 19);



                var newScore = targetAttribute.score + 2;
                character.UpdateAttribute(targetAttribute.name, newScore);
            }
        }

        private static int GetAttributePriority(string attributeName)
        {
            // tie-breaker priorities (lower is higher priority)
            return attributeName.ToLower() switch
            {
                "strength" => 0,
                "dexterity" => 1,
                "constitution" => 2,
                "intelligence" => 3,
                "wisdom" => 4,
                "charisma" => 5,
                _ => 99
            };
        }

        private static Dice GetHitDieForClass(CharacterClass @class)
        {
            return @class switch
            {
                CharacterClass.Barbarian => new D12(),
                CharacterClass.Fighter => new D10(),
                CharacterClass.Paladin => new D10(),
                CharacterClass.Ranger => new D10(),
                CharacterClass.Rogue => new D8(),
                CharacterClass.Bard => new D8(),
                CharacterClass.Cleric => new D8(),
                CharacterClass.Druid => new D8(),
                CharacterClass.Monk => new D8(),
                CharacterClass.Warlock => new D8(),
                CharacterClass.Sorcerer => new D6(),
                CharacterClass.Wizard => new D6(),
                _ => new D8()
            };
        }

        private static IEnumerable<string> GetSavingThrowNamesForClass(CharacterClass @class)
        {
            // Standard 5e saving throw proficiencies by class.
            return @class switch
            {
                CharacterClass.Barbarian => new[] { "Strength", "Constitution" },
                CharacterClass.Bard => new[] { "Dexterity", "Charisma" },
                CharacterClass.Cleric => new[] { "Wisdom", "Charisma" },
                CharacterClass.Druid => new[] { "Intelligence", "Wisdom" },
                CharacterClass.Fighter => new[] { "Strength", "Constitution" },
                CharacterClass.Monk => new[] { "Strength", "Dexterity" },
                CharacterClass.Paladin => new[] { "Wisdom", "Charisma" },
                CharacterClass.Ranger => new[] { "Strength", "Dexterity" },
                CharacterClass.Rogue => new[] { "Dexterity", "Intelligence" },
                CharacterClass.Sorcerer => new[] { "Constitution", "Charisma" },
                CharacterClass.Warlock => new[] { "Wisdom", "Charisma" },
                CharacterClass.Wizard => new[] { "Intelligence", "Wisdom" },
                _ => Array.Empty<string>()
            };
        }
    }
}