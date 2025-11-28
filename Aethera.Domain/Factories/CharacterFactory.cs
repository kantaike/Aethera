using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Factories.Interfaces;
using System;

namespace Aethera.Domain.Factories
{
    public class CharacterFactory : ICharacterFactory
    {
        public CharacterFactory()
        {
        }

        // Creates a character with explicit ability scores.
        // (params) name, species, class, strength, dexterity, constitution, intelligence, wisdom, charisma
        public Character CreateCharacter(string name, Species species, CharacterClass @class,
            int strength, int dexterity, int constitution,
            int intelligence, int wisdom, int charisma)
        {
            return new Character(
                name,
                species,
                @class,
                strength,
                dexterity,
                constitution,
                intelligence,
                wisdom,
                charisma);
        }

        // Creates a character using standard class-based ability distribution and applies racial modifiers.
        // This implements "standard D&D" allocation (class priorities) and then applies race bonuses
        // (e.g., Human +1 to all stats). No player preferences are considered.
        // (params) name, species, class
        public Character CreateCharacter(string name, Species species, CharacterClass @class)
        {
            var baseStats = GetClassBaseStats(@class);
            var racialMods = GetRacialModifiers(species);

            int str = baseStats.str + racialMods.str;
            int dex = baseStats.dex + racialMods.dex;
            int con = baseStats.con + racialMods.con;
            int intel = baseStats.intel + racialMods.intel;
            int wis = baseStats.wis + racialMods.wis;
            int cha = baseStats.cha + racialMods.cha;

            return new Character(
                name,
                species,
                @class,
                str,
                dex,
                con,
                intel,
                wis,
                cha);
        }

        // Creates a character using the standard distribution, then allows the caller to further
        // configure the Character instance using the public methods on Character (via Action).
        // Use this instead of a giant DTO: caller can call AddItem, AddSkillProficiency, SetAlignment, etc.
        // (params) name, species, class, configure
        public Character CreateCharacterDetailed(string name, Species species, CharacterClass? @class, Action<Character>? configure = null)
        {
            // If no class provided, construct with defaults (10s) and race modifiers applied as if "no class"
            Character character;
            if (@class.HasValue)
            {
                character = CreateCharacter(name, species, @class.Value);
            }
            else
            {
                // No class: start with defaults 10, then apply racial modifiers
                var racialMods = GetRacialModifiers(species);
                character = new Character(
                    name,
                    species,
                    null,
                    10 + racialMods.str,
                    10 + racialMods.dex,
                    10 + racialMods.con,
                    10 + racialMods.intel,
                    10 + racialMods.wis,
                    10 + racialMods.cha,
                    null);
            }

            configure?.Invoke(character);
            return character;
        }

        // Helper: base stats per class (standardized presets)
        private static (int str, int dex, int con, int intel, int wis, int cha) GetClassBaseStats(CharacterClass @class)
        {
            return @class switch
            {
                CharacterClass.Fighter => (15, 13, 14, 8, 10, 12),
                CharacterClass.Wizard => (8, 12, 10, 15, 14, 13),
                CharacterClass.Rogue => (12, 15, 13, 10, 14, 8),
                CharacterClass.Cleric => (13, 10, 14, 8, 15, 12),
                CharacterClass.Ranger => (14, 13, 12, 10, 15, 8),
                CharacterClass.Paladin => (15, 8, 14, 10, 12, 13),
                CharacterClass.Bard => (8, 14, 10, 12, 13, 15),
                CharacterClass.Warlock => (10, 13, 12, 8, 14, 15),
                CharacterClass.Sorcerer => (8, 12, 10, 13, 14, 15),
                CharacterClass.Druid => (10, 12, 13, 8, 15, 14),
                CharacterClass.Monk => (13, 15, 12, 10, 8, 14),
                CharacterClass.Barbarian => (15, 12, 14, 8, 10, 13),
                _ => (10, 10, 10, 10, 10, 10)
            };
        }

        // Helper: racial ability modifiers. Human: +1 to all. Other races follow common 5e-like defaults.
        private static (int str, int dex, int con, int intel, int wis, int cha) GetRacialModifiers(Species species)
        {
            return species switch
            {
                Species.Human => (1, 1, 1, 1, 1, 1),
                Species.Elf => (0, 2, 0, 0, 0, 0),         // +2 DEX
                Species.Dwarf => (0, 0, 2, 0, 0, 0),       // +2 CON
                Species.Halfling => (0, 2, 0, 0, 0, 0),    // +2 DEX
                Species.Gnome => (0, 0, 0, 2, 0, 0),       // +2 INT
                Species.Dragonborn => (2, 0, 0, 0, 0, 0),  // +2 STR
                Species.Tiefling => (0, 0, 0, 0, 0, 2),    // +2 CHA
                Species.Orc => (2, 0, 0, 0, 0, 0),         // +2 STR
                _ => (0, 0, 0, 0, 0, 0)
            };
        }
    }
}
