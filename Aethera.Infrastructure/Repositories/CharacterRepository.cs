using Aethera.Domain.Common;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Entities;
using Aethera.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure.Repositories
{
    public class CharacterRepository(ApplicationDbContext context, ICultureProvider cultureProvider, IMapper mapper) 
        : Repository<Character>(context, cultureProvider), ICharacterRepository
    {
        readonly IMapper _mapper = mapper;
        public async Task<List<RelativeDto>> GetFamilyTree(Guid characterId, CancellationToken ct)
        {
            var rawData = await _context.Set<CharacterEntity>()
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
            var rawDataDomain = rawData.Select(e => _mapper.Map<CharacterEntity, Character>(e)).ToList();
            var target = rawDataDomain.FirstOrDefault(c => c.Id == characterId);
            if (target == null) return new List<RelativeDto>();

            var result = new List<RelativeDto>();

            foreach (var person in rawDataDomain.Where(p => p.Id != characterId))
            {
                string role = "Relative";

                if (person.Id == target.FatherId) role = "Father";
                else if (rawDataDomain.Any(parent => (target.FatherId == parent.Id || target.MotherId == parent.Id) &&
                               (person.Id == parent.FatherId || person.Id == parent.MotherId)))
                {
                    role = "Grandparent";
                }

                else if (rawDataDomain.Any(gp => rawDataDomain.Any(parent =>
                    (target.FatherId == parent.Id || target.MotherId == parent.Id) &&
                    (parent.FatherId == gp.Id || parent.MotherId == gp.Id) &&
                    (person.Id == gp.FatherId || person.Id == gp.MotherId))))
                {
                    role = "Great-grandparent";
                }
                else if (person.Id == target.MotherId) role = "Mother";

                else if (person.FatherId == target.Id || person.MotherId == target.Id) role = "Child";

                else if (person.FatherId == target.FatherId && person.MotherId == target.MotherId && target.FatherId != null)
                    role = "Sibling";

                else if (rawDataDomain.Any(child => (child.FatherId == target.Id || child.MotherId == target.Id) &&
                                              (person.FatherId == child.Id || person.MotherId == child.Id)))
                    role = "Grandchild";

                else if (IsCousin(target, person, rawDataDomain))
                    role = "Cousin";

                result.Add(new RelativeDto(person.Id, person.Name ?? "Unknown", role, person.FatherId, person.MotherId));
            }

            return result;
        }
        public async Task<Character> AddWithTranslation(Character domainModel, CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            CharacterEntity entity = null;
            entity = _mapper.Map<Character, CharacterEntity>(domainModel);
            if (entity is ILocalizableEntity<CharacterTranslationEntity> localizable)
            {
                var translation = new CharacterTranslationEntity { Culture = culture };
                _mapper.Map<Character, CharacterTranslationEntity>(domainModel, translation);
                localizable.Translations = new List<CharacterTranslationEntity> { translation };
            }
            if (entity is null)
            {
                throw new InvalidOperationException($"Mapping resulted in null for entity of type {typeof(Entity)}");
            }
            await _context.Set<CharacterEntity>().AddAsync(entity, ct);
            return domainModel;
        }
        public async Task<Character> GetWithTranslation(Guid id, CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;
            var entity = await _context.Set<CharacterEntity>().Include("Translations")
            .FirstOrDefaultAsync(e => EF.Property<Guid>(e, "Id") == id)
             ?? throw new KeyNotFoundException($"{typeof(Entity)} with id {id} not found.");

            var translation = _context.Set<CharacterTranslationEntity>()
                .FirstOrDefault(t => t.CharacterId == id && t.Culture == culture);

            Character domainModel = null;

            domainModel = _mapper.Map<CharacterEntity, Character>(entity);
            if (translation != null)
            {

                _mapper.Map<CharacterTranslationEntity, Character>(translation, domainModel);
            }
            if (domainModel is null)
            {
                throw new InvalidOperationException($"Mapping resulted in null for entity of type {typeof(Entity)}");
            }
            return domainModel;
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

        public Task<IEnumerable<Character>> GetAllWithTranslation(CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;
            var entities = _context.Set<CharacterEntity>().Include("Translations").AsNoTracking().ToListAsync(ct);

            var domainModels = entities.Result.Select(entity =>
            {
                var translation = entity.Translations.FirstOrDefault(t => t.Culture == culture);
                var domainModel = _mapper.Map<CharacterEntity, Character>(entity);
                if (translation != null)
                {
                    _mapper.Map<CharacterTranslationEntity, Character>(translation, domainModel);
                }
                return domainModel;
            }).ToList();

            return Task.FromResult(domainModels.AsEnumerable());
        }

        public Task AddTranslation(Guid id, string? name, string? feats, string? backstory, string? personality)
        {
            var culture = _cultureProvider.Culture;
            var entity = _context.Set<CharacterEntity>().FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new KeyNotFoundException($"{typeof(Entity)} with id {id} not found.");
            }
            bool isTranslationExist = _context.Set<CharacterTranslationEntity>().Any(t => t.CharacterId == id && t.Culture == culture);
            if (isTranslationExist)
            {
                throw new InvalidOperationException($"Translation for {typeof(Entity)} with id {id} already exists for culture {culture}.");
            }
            var translationEntity = new CharacterTranslationEntity
            {
                Culture = culture,
                Name = name,
                Feats = feats,
                Backstory = backstory,
                Personality = personality
            };
            translationEntity.CharacterId = entity.Id;
            _context.Set<CharacterTranslationEntity>().Add(translationEntity);
            return Task.FromResult(translationEntity);
        }

        public async Task<IEnumerable<Character>> GetCharactersByDynasty(Guid dynastyId)
        {
            await _context.Set<CharacterEntity>().Where(c => c.DynastyId == dynastyId).ToListAsync();
            var entities = await _context.Set<CharacterEntity>().Where(c => c.DynastyId == dynastyId).Include("Translations").AsNoTracking().ToListAsync();
            var domainModels = entities.Select(entity =>
            {
                var culture = _cultureProvider.Culture;
                var translation = entity.Translations.FirstOrDefault(t => t.Culture == culture);
                var domainModel = _mapper.Map<CharacterEntity, Character>(entity);
                if (translation != null)
                {
                    _mapper.Map<CharacterTranslationEntity, Character>(translation, domainModel);
                }
                return domainModel;
            }).ToList();
            return domainModels;
        }
    }
}
