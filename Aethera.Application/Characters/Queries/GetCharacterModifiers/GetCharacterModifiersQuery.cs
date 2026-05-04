using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Aethera.Application.Common.Interfaces;
using Aethera.Application.DTOs;
using Aethera.Application.Services;
using Aethera.Domain.Entities.Basic;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Characters.Queries.GetCharacterModifiers
{
    public record GetCharacterModifiersQuery(Guid CharacterId);

    public class GetCharacterModifiersHandler : IQueryHandler<GetCharacterModifiersQuery, CharacterModifiersDto>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly ModifierService _modifierService;

        public GetCharacterModifiersHandler(ICharacterRepository characterRepository, ModifierService modifierService)
        {
            _characterRepository = characterRepository;
            _modifierService = modifierService;
        }

        public async Task<CharacterModifiersDto> HandleAsync(GetCharacterModifiersQuery query, CancellationToken ct)
        {
            var character = await _characterRepository.Get(query.CharacterId, ct);
            if (character == null)
                throw new ArgumentException($"Character with ID {query.CharacterId} not found");

            var personalModifiers = character.Modifiers.Select(MapToDto).ToList();
            var allActiveModifiers = _modifierService.GetAllActiveModifiers(character, character.Weapons, character.Armors);
            var equipmentModifiers = allActiveModifiers
                .Where(m => m.SourceType == ModifierSourceType.Item)
                .Select(MapToDto)
                .ToList();

            var result = new CharacterModifiersDto
            {
                PersonalModifiers = personalModifiers,
                EquipmentModifiers = equipmentModifiers,
                StatBreakdown = BuildStatBreakdown(character, allActiveModifiers)
            };

            return await Task.FromResult(result);
        }

        private ModifierDto MapToDto(Modifier modifier)
        {
            return new ModifierDto
            {
                Id = modifier.Id,
                SourceId = modifier.SourceId,
                SourceType = modifier.SourceType.ToString(),
                Label = modifier.Label,
                StatType = modifier.StatType.ToString(),
                Type = modifier.Type.ToString(),
                Category = modifier.Category.ToString(),
                Value = modifier.Value,
                Priority = modifier.Priority
            };
        }

        private Dictionary<string, ModifierBreakdownDto> BuildStatBreakdown(
            Domain.Entities.Characters.Character character,
            List<Modifier> allActiveModifiers)
        {
            var breakdown = new Dictionary<string, ModifierBreakdownDto>();

            var statTypes = Enum.GetValues(typeof(StatType)).Cast<StatType>().ToList();

            foreach (var statType in statTypes)
            {
                double baseValue = GetBaseStatValue(character, statType);
                var applicableModifiers = allActiveModifiers
                    .Where(m => m.StatType == statType)
                    .ToList();

                double finalValue = _modifierService.CalculateModifiedValue(baseValue, applicableModifiers, statType);

                breakdown[statType.ToString()] = new ModifierBreakdownDto
                {
                    BaseValue = baseValue,
                    FinalValue = finalValue,
                    Modifiers = applicableModifiers.Select(MapToDto).ToList()
                };
            }

            return breakdown;
        }

        private double GetBaseStatValue(Domain.Entities.Characters.Character character, StatType statType)
        {
            return statType switch
            {
                StatType.Strength => character.Strength?.Score ?? 10,
                StatType.Dexterity => character.Dexterity?.Score ?? 10,
                StatType.Constitution => character.Constitution?.Score ?? 10,
                StatType.Intelligence => character.Intelligence?.Score ?? 10,
                StatType.Wisdom => character.Wisdom?.Score ?? 10,
                StatType.Charisma => character.Charisma?.Score ?? 10,
                StatType.Speed => character.Speed ?? 30,
                _ => 0
            };
        }
    }
}
