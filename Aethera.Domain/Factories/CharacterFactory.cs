using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Factories.Interfaces;
using System;
using Aethera.Domain.Entities.Basic;
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

            var character = new Character(
                name,
                species,
                @class,
                baseStats.str,
                baseStats.dex,
                baseStats.con,
                baseStats.intel,
                baseStats.wis,
                baseStats.cha);

            ApplyRacialModifiers(character);
            return character;
        }

        // Creates a character using the factory defaults and then applies custom configuration via Action
        public Character CreateCharacterDetailed(string name, Species species, CharacterClass? @class, Action<Character> configure)
        {
            var character = @class.HasValue
                ? CreateCharacter(name, species, @class.Value)
                : new Character(name, species, null);

            configure(character);
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
        private static void ApplyRacialModifiers(Character character)
        {
            switch (character.Species)
            {   
                case Species.Human:
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Strength, ModifierType.Flat, ModifierCategory.Base, 1, 100, null, "Race"));
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Dexterity, ModifierType.Flat, ModifierCategory.Base, 1, 100, null, "Race"));
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Constitution, ModifierType.Flat, ModifierCategory.Base, 1, 100, null, "Race"));
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Intelligence, ModifierType.Flat, ModifierCategory.Base, 1, 100, null, "Race"));
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Wisdom, ModifierType.Flat, ModifierCategory.Base, 1, 100, null, "Race"));
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Charisma, ModifierType.Flat, ModifierCategory.Base, 1, 100, null, "Race"));
                    break;
                case Species.Elf:
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Dexterity, ModifierType.Flat, ModifierCategory.Base, 2, 100, null, "Race"));
                    break;
                case Species.Dwarf:
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Constitution, ModifierType.Flat, ModifierCategory.Base, 2, 100, null, "Race"));
                    break;
                case Species.Halfling:
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Dexterity, ModifierType.Flat, ModifierCategory.Base, 2, 100, null, "Race"));
                    break;
                case Species.Orc:
                        character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Strength, ModifierType.Flat, ModifierCategory.Base, 2, 100, null, "Race"));
                    break;
                case Species.Gnome:
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Intelligence, ModifierType.Flat, ModifierCategory.Base, 2, 100, null, "Race"));
                    break;
                case Species.Tiefling:
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Charisma, ModifierType.Flat, ModifierCategory.Base, 2, 100, null, "Race"));
                    break;
                case Species.Dragonborn:
                    character.AddModifier(new Modifier(ModifierSourceType.Character, StatType.Constitution, ModifierType.Flat, ModifierCategory.Base, 1, 100, null, "Race"));
                    break;
                default:
                    throw new ArgumentException($"Unknown species: {character.Species}");
            }
        }
    }
}
