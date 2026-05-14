using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Entities.Basic;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Aethera.Application.Services
{
    public class ModifierService
    {
        /// <summary>
        /// Отримує всі активні модифікатори для персонажа (персональні + від екіпірованих предметів)
        /// </summary>
        public List<Modifier> GetAllActiveModifiers(Character character, IEnumerable<Weapon> allWeapons, IEnumerable<Armor> allArmors)
        {
            var activeModifiers = new List<Modifier>(character.Modifiers);

            // Додавання модифікаторів від екіпірованої зброї
            if (character.Weapons.FirstOrDefault(w => w.Id == character.EquipedWeaponId) is Weapon equipedWeapon)
            {
                foreach (var modifier in equipedWeapon.Modifiers)
                {
                    var modifierCopy = new Modifier(
                        sourceType: ModifierSourceType.Item,
                        statType: modifier.StatType,
                        type: modifier.Type,
                        category: modifier.Category,
                        value: modifier.Value,
                        priority: modifier.Priority,
                        sourceId: modifier.SourceId ?? equipedWeapon.Id,
                        label: modifier.Label);
                    activeModifiers.Add(modifierCopy);
                }
            }

            // Додавання модифікаторів від екіпірованої броні
            if (character.Armors.FirstOrDefault(a => a.Id == character.EquipedArmorId) is Armor equipedArmor)
            {
                foreach (var modifier in equipedArmor.Modifiers)
                {
                    var modifierCopy = new Modifier(
                        sourceType: ModifierSourceType.Item,
                        statType: modifier.StatType,
                        type: modifier.Type,
                        category: modifier.Category,
                        value: modifier.Value,
                        priority: modifier.Priority,
                        sourceId: modifier.SourceId ?? equipedArmor.Id,
                        label: modifier.Label);
                    activeModifiers.Add(modifierCopy);
                }
            }

            return activeModifiers;
        }

        /// <summary>
        /// Застосовує модифікатор до атрибута персонажа
        /// </summary>
        public void ApplyAttributeModifier(Character character, Modifier modifier)
        {
            if (modifier.Type != ModifierType.Flat)
                return; // Поки застосовуємо тільки плоскі модифікатори до атрибутів

            var attributeModifier = (int)Math.Round(modifier.Value);

            switch (modifier.StatType)
            {
                case StatType.Strength:
                    character.UpdateAttribute("strength", (character.Strength?.Score ?? 10) + attributeModifier);
                    break;
                case StatType.Dexterity:
                    character.UpdateAttribute("dexterity", (character.Dexterity?.Score ?? 10) + attributeModifier);
                    break;
                case StatType.Constitution:
                    character.UpdateAttribute("constitution", (character.Constitution?.Score ?? 10) + attributeModifier);
                    break;
                case StatType.Intelligence:
                    character.UpdateAttribute("intelligence", (character.Intelligence?.Score ?? 10) + attributeModifier);
                    break;
                case StatType.Wisdom:
                    character.UpdateAttribute("wisdom", (character.Wisdom?.Score ?? 10) + attributeModifier);
                    break;
                case StatType.Charisma:
                    character.UpdateAttribute("charisma", (character.Charisma?.Score ?? 10) + attributeModifier);
                    break;
                case StatType.Speed:
                    character.UpdateSpeed((character.Speed ?? 30) + attributeModifier);
                    break;
            }
        }

        /// <summary>
        /// Розраховує модифікацію для атрибута з урахуванням пріоритету
        /// </summary>
        public double CalculateModifiedValue(double baseValue, IEnumerable<Modifier> modifiers, StatType statType)
        {
            var applicableModifiers = modifiers
                .Where(m => m.StatType == statType)
                .OrderBy(m => m.Priority)
                .ToList();

            double result = baseValue;

            // Override має найвищий пріоритет
            var overrideModifier = applicableModifiers.FirstOrDefault(m => m.Type == ModifierType.Override);
            if (overrideModifier != null)
            {
                return overrideModifier.Value;
            }

            // Потім плоскі модифікатори (Flat)
            foreach (var flatMod in applicableModifiers.Where(m => m.Type == ModifierType.Flat))
            {
                result += flatMod.Value;
            }

            // Нарешті мультиплікатори (Multiplier)
            foreach (var multiplierMod in applicableModifiers.Where(m => m.Type == ModifierType.Multiplier))
            {
                result *= (1 + multiplierMod.Value / 100.0);
            }

            return result;
        }

        /// <summary>
        /// Отримує модифікатори за конкретною стат-типом, згрупованими за джерелом
        /// </summary>
        public Dictionary<Guid?, List<Modifier>> GetModifiersBySource(IEnumerable<Modifier> modifiers, StatType statType)
        {
            return modifiers
                .Where(m => m.StatType == statType)
                .GroupBy(m => m.SourceId)
                .ToDictionary(g => g.Key, g => g.ToList());
        }
    }
}
