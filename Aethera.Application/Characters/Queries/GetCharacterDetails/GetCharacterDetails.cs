using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Common;
using Aethera.Domain.Entities.Basic;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;
using Aethera.Domain.ValueObjects;

namespace Aethera.Application.Characters.Queries.GetCharacterDetails
{
    public record GetCharacterDetailQuery(Guid Id);

    public record CharacterDetailDto(
        Guid Id,
        string? Name,
        Species Species,
        CharacterClass? CharacterClass,
        AttributeScore StrengthScore,
        AttributeScore DexterityScore,
        AttributeScore ConstitutionScore,
        AttributeScore IntelligenceScore,
        AttributeScore WisdomScore,
        AttributeScore CharismaScore,
        int Level,
        long? ExperiencePoints,
        Size Size,
        Alignment? Alignment,
        Art? Art,
        Guid? DynastyId,
        Guid? FatherId,
        Guid? MotherId,
        Guid? HometownId,
        int? ProficiencyBonus,
        int? Initiative,
        int? ArmorClass,
        int? Speed,
        int? PassivePerception,
        HitPoints? HP,
        Dice? HitDice,
        int? DeathSaveSuccesses,
        int? DeathSaveFailures,
        List<Skill> SkillProficiencies,
        List<Language> LanguageProficiencies,
        string? Feats,
        int? HeroicInspirationCount,
        string? Backstory,
        string? Personality,
        List<RelativeDto> Relatives
    );

    public class GetCharacterDetailQueryHandler : IQueryHandler<GetCharacterDetailQuery, CharacterDetailDto>
    {
        private readonly ICharacterRepository _characterRepository;

        public GetCharacterDetailQueryHandler(ICharacterRepository repository)
        {
            _characterRepository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<CharacterDetailDto> HandleAsync(GetCharacterDetailQuery query, CancellationToken ct = default)
        {
            if (query is null) throw new ArgumentNullException(nameof(query));
            var character = await _characterRepository.GetWithTranslation(query.Id, ct).ConfigureAwait(false);

            if (character == null)
            {
                throw new KeyNotFoundException($"Character with id '{query.Id}' was not found.");
            }

            var skillProficiencies = character.SkillProficiencies != null
                ? character.SkillProficiencies.ToList()
                : new List<Skill>();

            var languageProficiencies = character.LanguageProficiencies != null
                ? character.LanguageProficiencies.ToList()
                : new List<Language>();
            var relatives = await _characterRepository.GetFamilyTree(character.Id, ct).ConfigureAwait(false);
           
            return new CharacterDetailDto(
                character.Id,
                character.Name,
                character.Species,
                character.Class,
                character.Strength,
                character.Dexterity,
                character.Constitution,
                character.Intelligence,
                character.Wisdom,
                character.Charisma,
                character.Level,
                character.ExperiencePoints,
                character.Size,
                character.Alignment,
                character.Art,
                character.DynastyId,
                character.FatherId,
                character.MotherId,
                character.HometownId,
                character.ProficiencyBonus,
                character.Initiative,
                character.ArmorClass,
                character.Speed,
                character.PassivePerception,
                character.HP,
                character.HitDice,
                character.DeathSaveSuccesses,
                character.DeathSaveFailures,
                skillProficiencies,
                languageProficiencies,
                character.Feats,
                character.HeroicInspirationCount,
                character.Backstory,
                character.Personality,
                relatives
            );
        }
    }
}
