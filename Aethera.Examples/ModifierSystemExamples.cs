using Aethera.Application.Characters.Commands.AddModifier;
using Aethera.Application.Characters.Queries.GetCharacterModifiers;
using Aethera.Application.DTOs;
using Aethera.Application.Items.Commands.AddModifier;
using Aethera.Application.Items.Queries.GetItemModifiers;
using Aethera.Application.Services;
using Aethera.Domain.Entities.Basic;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Entities.Items;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Aethera.Examples
{
    /// <summary>
    /// Приклади використання системи модифікаторів
    /// </summary>
    public class ModifierSystemExamples
    {
        private readonly ModifierService _modifierService;

        public ModifierSystemExamples(ModifierService modifierService)
        {
            _modifierService = modifierService;
        }

        /// <summary>
        /// Приклад 1: Додавання персонального модифікатора до персонажа (раса)
        /// </summary>
        public Modifier CreateHumanStrengthBonus()
        {
            return new Modifier
            {
                Id = Guid.NewGuid(),
                SourceType = ModifierSourceType.Character,
                Label = "Human +2 Strength",
                StatType = StatType.Strength,
                Type = ModifierType.Flat,
                Category = ModifierCategory.Permanent,
                Value = 2,
                Priority = 100
            };
        }

        /// <summary>
        /// Приклад 2: Додавання модифікатора броні для Armor Class
        /// </summary>
        public Modifier CreateIronArmorACModifier()
        {
            return new Modifier
            {
                Id = Guid.NewGuid(),
                Label = "Iron Armor AC 16",
                StatType = StatType.ArmorClass,
                Type = ModifierType.Override,
                Category = ModifierCategory.Equipment,
                Value = 16,
                Priority = 0
            };
        }

        /// <summary>
        /// Приклад 3: Додавання модифікатора зброї для Strength
        /// </summary>
        public Modifier CreateSwordStrengthBonus()
        {
            return new Modifier
            {
                Id = Guid.NewGuid(),
                Label = "Iron Sword +1 Strength",
                StatType = StatType.Strength,
                Type = ModifierType.Flat,
                Category = ModifierCategory.Equipment,
                Value = 1,
                Priority = 100
            };
        }

        /// <summary>
        /// Приклад 4: Додавання модифікатора швидкості від легкої броні
        /// </summary>
        public Modifier CreateLeatherArmorSpeedBonus()
        {
            return new Modifier
            {
                Id = Guid.NewGuid(),
                Label = "Leather Armor +5 Speed",
                StatType = StatType.Speed,
                Type = ModifierType.Flat,
                Category = ModifierCategory.Equipment,
                Value = 5,
                Priority = 100
            };
        }

        /// <summary>
        /// Приклад 5: Додавання мультиплікатора (наприклад, магічна зброя +10%)
        /// </summary>
        public Modifier CreateMagicWeaponMultiplier()
        {
            return new Modifier
            {
                Id = Guid.NewGuid(),
                Label = "Magic Sword +10%",
                StatType = StatType.Strength,
                Type = ModifierType.Multiplier,
                Category = ModifierCategory.Equipment,
                Value = 10, // 10% = 1.10 множник
                Priority = 200
            };
        }

        /// <summary>
        /// Приклад 6: Розрахунок фіналки з різними модифікаторами
        /// 
        /// Розрахунок:
        /// Base Strength = 10
        /// + Human Bonus (+2 Flat)
        /// + Sword Bonus (+1 Flat)
        /// × Magic Multiplier (×1.10)
        /// = (10 + 2 + 1) × 1.10 = 16.3
        /// </summary>
        public void CalculateModifiedValueExample()
        {
            double baseStrength = 10;
            var modifiers = new List<Modifier>
            {
                CreateHumanStrengthBonus(),
                CreateSwordStrengthBonus(),
                CreateMagicWeaponMultiplier()
            };

            double finalStrength = _modifierService.CalculateModifiedValue(
                baseStrength,
                modifiers,
                StatType.Strength
            );

            Console.WriteLine($"Base Strength: {baseStrength}");
            Console.WriteLine($"Final Strength: {finalStrength}"); // 16.3
        }

        /// <summary>
        /// Приклад 7: Отримання модифікаторів за джерелом (для UI)
        /// </summary>
        public void GetModifiersBySourceExample()
        {
            var modifiers = new List<Modifier>
            {
                CreateHumanStrengthBonus(),
                CreateSwordStrengthBonus(),
                new Modifier
                {
                    Id = Guid.NewGuid(),
                    Label = "Battle Buff +3 STR",
                    StatType = StatType.Strength,
                    Type = ModifierType.Flat,
                    Category = ModifierCategory.Temporary,
                    Value = 3,
                    Priority = 100
                }
            };

            var breakdown = _modifierService.GetModifiersBySource(modifiers, StatType.Strength);

            foreach (var source in breakdown)
            {
                var sourceName = source.Key?.ToString() ?? "No Source";
                Console.WriteLine($"\nSource: {sourceName}");
                foreach (var mod in source.Value)
                {
                    Console.WriteLine($"  - {mod.Label}: {mod.Value}");
                }
            }
        }

        /// <summary>
        /// Приклад 8: Комплексний сценарій
        /// - Персонаж людина зі Strength 10
        /// - Екіпірував зелізну броню (AC 16)
        /// - Екіпірував залізний меч (+1 STR, +10%)
        /// </summary>
        public void ComplexScenarioExample(Character character, Weapon sword, Armor armor)
        {
            // 1. Додаємо персональний модифікатор (раса)
            var humanBonus = CreateHumanStrengthBonus();
            character.AddModifier(humanBonus);

            // 2. Додаємо модифікатори до предметів
            sword.AddModifier(CreateSwordStrengthBonus());
            sword.AddModifier(CreateMagicWeaponMultiplier());

            armor.AddModifier(CreateIronArmorACModifier());
            armor.AddModifier(CreateLeatherArmorSpeedBonus());

            // 3. Екіпіруємо предмети
            character.EquipItem(sword);
            character.EquipItem(armor);

            // 4. Отримуємо всі активні модифікатори
            var allModifiers = _modifierService.GetAllActiveModifiers(character, character.Weapons, character.Armors);

            // 5. Розраховуємо фіналку
            var finalStrength = _modifierService.CalculateModifiedValue(
                character.Strength.Score,
                allModifiers,
                StatType.Strength
            );

            // 6. Розраховуємо AC з модифікаторів зброї
            var finalAC = _modifierService.CalculateModifiedValue(
                10,
                allModifiers,
                StatType.ArmorClass
            );

            Console.WriteLine("=== Character Stats ===");
            Console.WriteLine($"Base Strength: {character.Strength.Score}");
            Console.WriteLine($"Final Strength: {finalStrength}");
            Console.WriteLine($"Final AC: {finalAC}");
            Console.WriteLine($"Speed: {character.Speed}");
        }
    }
}
