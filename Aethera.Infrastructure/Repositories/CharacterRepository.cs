using Aethera.Domain.Common;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Entities;
using Aethera.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Aethera.Infrastructure.Repositories
{
    public class CharacterRepository(ApplicationDbContext context, ICultureProvider cultureProvider)
        : Repository<Character>(context, cultureProvider), ICharacterRepository
    {
        public override async Task Add(Character domainModel, CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            await _context.Set<Character>().AddAsync(domainModel, ct);

            var translation = new CharacterTranslationEntity
            {
                Culture = culture,
                Name = domainModel.Name,
                Feats = domainModel.Feats,
                Backstory = domainModel.Backstory,
                Personality = domainModel.Personality,
                CharacterId = domainModel.Id
            };

            _context.Set<CharacterTranslationEntity>().Add(translation);
        }

        public override async Task<Character> Get(Guid id, CancellationToken ct)
        {
            var character = await _context.Set<Character>().FindAsync([id], ct)
                ?? throw new KeyNotFoundException($"Character with id {id} not found.");

            var translations = await _context.Set<CharacterTranslationEntity>()
                .Where(t => t.CharacterId == id)
                .ToListAsync(ct);

            ApplyTranslation(character, SelectPreferredTranslation(translations));

            return character;
        }

        public override async Task<IEnumerable<Character>> Get(CancellationToken ct)
        {
            var characters = await _context.Set<Character>().AsNoTracking().ToListAsync(ct);
            var characterIds = characters.Select(c => c.Id).ToList();

            if (!characterIds.Any())
                return characters;

            var translations = await _context.Set<CharacterTranslationEntity>()
                .Where(t => characterIds.Contains(t.CharacterId))
                .ToListAsync(ct);

            var translationMap = translations
                .GroupBy(t => t.CharacterId)
                .ToDictionary(g => g.Key, g => SelectPreferredTranslation(g));

            foreach (var character in characters)
            {
                if (translationMap.TryGetValue(character.Id, out var translation))
                    ApplyTranslation(character, translation);
            }

            return characters;
        }

        public Task AddTranslation(Guid id, string? name, string? feats, string? backstory, string? personality)
        {
            var culture = _cultureProvider.Culture;

            var entity = _context.Set<Character>().FirstOrDefault(e => e.Id == id)
                ?? throw new KeyNotFoundException($"Character with id {id} not found.");

            bool isTranslationExist = _context.Set<CharacterTranslationEntity>()
                .Any(t => t.CharacterId == id && t.Culture == culture);

            if (isTranslationExist)
                throw new InvalidOperationException($"Translation for Character with id {id} already exists for culture {culture}.");

            var translationEntity = new CharacterTranslationEntity
            {
                Culture = culture,
                Name = name,
                Feats = feats,
                Backstory = backstory,
                Personality = personality,
                CharacterId = entity.Id
            };

            _context.Set<CharacterTranslationEntity>().Add(translationEntity);
            return Task.CompletedTask;
        }

        public async Task UpsertTraitsAndFeaturesTranslation(Guid id, string? feats, string? backstory, string? personality, CancellationToken ct)
        {
            var character = await Get(id, ct);
            var culture = _cultureProvider.Culture;

            var translation = await _context.Set<CharacterTranslationEntity>()
                .FirstOrDefaultAsync(t => t.CharacterId == id && t.Culture == culture, ct);

            if (translation is null)
            {
                translation = new CharacterTranslationEntity
                {
                    CharacterId = character.Id,
                    Culture = culture,
                    Name = character.Name,
                    Feats = feats,
                    Backstory = backstory,
                    Personality = personality
                };

                _context.Set<CharacterTranslationEntity>().Add(translation);
                return;
            }

            translation.Feats = feats;
            translation.Backstory = backstory;
            translation.Personality = personality;
        }

        public async Task<List<RelativeDto>> GetFamilyTree(Guid characterId, CancellationToken ct)
        {
            var rawData = await _context.Set<Character>()
                .FromSqlRaw(@"
                WITH RECURSIVE Ancestors AS (
                    SELECT * FROM ""Characters"" WHERE ""Id"" = {0}
                    UNION ALL
                    SELECT c.* FROM ""Characters"" c 
                    JOIN Ancestors a ON c.""Id"" = a.""FatherId"" OR c.""Id"" = a.""MotherId""
                )
                SELECT DISTINCT * FROM (
                    SELECT * FROM Ancestors
                    UNION
                    SELECT c.* FROM ""Characters"" c 
                    JOIN Ancestors a ON c.""FatherId"" = a.""Id"" OR c.""MotherId"" = a.""Id""
                ) AS Family", characterId)
                .AsNoTracking()
                .ToListAsync(ct);

            ApplyTranslations(rawData);

            var target = rawData.FirstOrDefault(c => c.Id == characterId);
            if (target == null) return new List<RelativeDto>();

            var result = new List<RelativeDto>();

            foreach (var person in rawData.Where(p => p.Id != characterId))
            {
                string role = "Relative";

                if (person.Id == target.FatherId) role = "Father";
                else if (rawData.Any(parent => (target.FatherId == parent.Id || target.MotherId == parent.Id) &&
                               (person.Id == parent.FatherId || person.Id == parent.MotherId)))
                    role = "Grandparent";
                else if (rawData.Any(gp => rawData.Any(parent =>
                    (target.FatherId == parent.Id || target.MotherId == parent.Id) &&
                    (parent.FatherId == gp.Id || parent.MotherId == gp.Id) &&
                    (person.Id == gp.FatherId || person.Id == gp.MotherId))))
                    role = "Great-grandparent";
                else if (person.Id == target.MotherId) role = "Mother";
                else if (person.FatherId == target.Id || person.MotherId == target.Id) role = "Child";
                else if (person.FatherId == target.FatherId && person.MotherId == target.MotherId && target.FatherId != null)
                    role = "Sibling";
                else if (rawData.Any(child => (child.FatherId == target.Id || child.MotherId == target.Id) &&
                                              (person.FatherId == child.Id || person.MotherId == child.Id)))
                    role = "Grandchild";
                else if (IsCousin(target, person, rawData))
                    role = "Cousin";

                result.Add(new RelativeDto(person.Id, person.Name ?? "Unknown", role, person.FatherId, person.MotherId));
            }

            return result;
        }

        public async Task<IEnumerable<Character>> GetCharactersByDynasty(Guid dynastyId)
        {
            var characters = await _context.Set<Character>()
                .Where(c => c.DynastyId == dynastyId)
                .AsNoTracking()
                .ToListAsync();

            ApplyTranslations(characters);

            return characters;
        }

        public async Task<IEnumerable<Character>> GetCharactersByUserId(Guid userId, CancellationToken ct)
        {
            var characters = await _context.Set<Character>()
                .Where(c => c.UserId == userId)
                .AsNoTracking()
                .ToListAsync(ct);

            ApplyTranslations(characters);

            return characters;
        }

        private void ApplyTranslations(IEnumerable<Character> characters)
        {
            var characterList = characters.ToList();
            var characterIds = characterList.Select(c => c.Id).ToList();

            if (!characterIds.Any())
                return;

            var translations = _context.Set<CharacterTranslationEntity>()
                .Where(t => characterIds.Contains(t.CharacterId))
                .ToList();

            var translationMap = translations
                .GroupBy(t => t.CharacterId)
                .ToDictionary(g => g.Key, g => SelectPreferredTranslation(g));

            foreach (var character in characterList)
            {
                if (translationMap.TryGetValue(character.Id, out var translation))
                    ApplyTranslation(character, translation);
            }
        }

        private CharacterTranslationEntity? SelectPreferredTranslation(IEnumerable<CharacterTranslationEntity> translations)
        {
            var culture = _cultureProvider.Culture;

            return translations.FirstOrDefault(t => t.Culture == culture)
                ?? translations.FirstOrDefault(t => t.Culture == Culture.enUS)
                ?? translations.FirstOrDefault();
        }

        private static void ApplyTranslation(Character character, CharacterTranslationEntity? translation)
        {
            if (translation != null)
                character.ApplyTranslation(translation.Name, translation.Feats, translation.Backstory, translation.Personality);
        }

        private bool IsCousin(Character target, Character person, List<Character> all)
        {
            var targetParents = all.Where(p => p.Id == target.FatherId || p.Id == target.MotherId).Select(p => p.Id);
            var personParents = all.Where(p => p.Id == person.FatherId || p.Id == person.MotherId).Select(p => p.Id);

            if (!targetParents.Intersect(personParents).Any())
            {
                var targetGParents = all.Where(p => targetParents.Contains(p.Id)).SelectMany(p => new[] { p.FatherId, p.MotherId });
                var personGParents = all.Where(p => personParents.Contains(p.Id)).SelectMany(p => new[] { p.FatherId, p.MotherId });

                return targetGParents.Intersect(personGParents).Any(id => id != null);
            }
            return false;
        }
    }
}
