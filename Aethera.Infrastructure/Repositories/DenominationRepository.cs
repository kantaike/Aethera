using Aethera.Domain.Common;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Entities;
using Aethera.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aethera.Infrastructure.Repositories
{
    internal class DenominationRepository(ApplicationDbContext context, ICultureProvider cultureProvider)
        : Repository<Denomination>(context, cultureProvider), IDenominationRepository
    {
        public override async Task Add(Denomination denomination, CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            await _context.Set<Denomination>().AddAsync(denomination, ct);

            var translationEntity = new DenominationTranslationEntity
            {
                Culture = culture,
                Name = denomination.Name,
                Description = denomination.Description,
                Tenets = denomination.Tenets,
                Appearance = denomination.Appearance,
                DenominationId = denomination.Id
            };

            _context.Set<DenominationTranslationEntity>().Add(translationEntity);
        }

        public override async Task<Denomination> Get(Guid id, CancellationToken ct)
        {
            var denomination = await _context.Set<Denomination>().FindAsync([id], ct)
                ?? throw new KeyNotFoundException($"Denomination with id {id} not found.");

            var translations = await _context.Set<DenominationTranslationEntity>()
                .Where(t => t.DenominationId == id)
                .ToListAsync(ct);

            ApplyTranslation(denomination, SelectPreferredTranslation(translations));

            return denomination;
        }

        public override async Task<IEnumerable<Denomination>> Get(CancellationToken ct)
        {
            var denominations = await _context.Set<Denomination>().AsNoTracking().ToListAsync(ct);
            var denominationIds = denominations.Select(d => d.Id).ToList();

            if (!denominationIds.Any())
                return denominations;

            var translations = await _context.Set<DenominationTranslationEntity>()
                .Where(t => denominationIds.Contains(t.DenominationId))
                .ToListAsync(ct);

            var translationMap = translations
                .GroupBy(t => t.DenominationId)
                .ToDictionary(g => g.Key, g => SelectPreferredTranslation(g));

            foreach (var denomination in denominations)
            {
                if (translationMap.TryGetValue(denomination.Id, out var translation))
                    ApplyTranslation(denomination, translation);
            }

            return denominations;
        }

        public async Task AddTranslation(Guid id, string? name, string? description, string? tenets, string? appearance)
        {
            var culture = _cultureProvider.Culture;

            var entity = await _context.Set<Denomination>().FindAsync(id)
                ?? throw new KeyNotFoundException($"Denomination with id {id} not found.");

            bool isTranslationExist = await _context.Set<DenominationTranslationEntity>()
                .AnyAsync(t => t.DenominationId == id && t.Culture == culture);

            if (isTranslationExist)
                throw new InvalidOperationException($"Translation for Denomination with id {id} already exists for culture {culture}.");

            var translationEntity = new DenominationTranslationEntity
            {
                Culture = culture,
                Name = name,
                Description = description,
                Tenets = tenets,
                Appearance = appearance,
                DenominationId = entity.Id
            };

            _context.Set<DenominationTranslationEntity>().Add(translationEntity);
        }

        public async Task UpsertTranslation(Guid id, string? name, string? description, string? tenets, string? appearance, CancellationToken ct)
        {
            var denomination = await Get(id, ct);
            var culture = _cultureProvider.Culture;

            var translation = await _context.Set<DenominationTranslationEntity>()
                .FirstOrDefaultAsync(t => t.DenominationId == id && t.Culture == culture, ct);

            if (translation is null)
            {
                translation = new DenominationTranslationEntity
                {
                    DenominationId = denomination.Id,
                    Culture = culture,
                    Name = name ?? denomination.Name,
                    Description = description ?? denomination.Description,
                    Tenets = tenets ?? denomination.Tenets,
                    Appearance = appearance ?? denomination.Appearance
                };

                _context.Set<DenominationTranslationEntity>().Add(translation);
                return;
            }

            translation.Name = name ?? translation.Name ?? denomination.Name;
            translation.Description = description;
            translation.Tenets = tenets;
            translation.Appearance = appearance;
        }

        public async Task UpsertRelation(Guid sourceId, Guid targetId, int value, string? context, CancellationToken ct)
        {
            var relation = await _context.Set<DenominationRelation>()
                .FirstOrDefaultAsync(r => r.SourceId == sourceId && r.TargetId == targetId, ct);

            if (relation is null)
            {
                relation = new DenominationRelation(sourceId, targetId, value, context);
                await _context.Set<DenominationRelation>().AddAsync(relation, ct);
                return;
            }

            relation.Value = value;
            relation.Context = context;
        }

        public async Task<IEnumerable<DenominationRelation>> GetRelations(Guid denominationId, CancellationToken ct)
        {
            return await _context.Set<DenominationRelation>()
                .Where(r => r.SourceId == denominationId || r.TargetId == denominationId)
                .AsNoTracking()
                .ToListAsync(ct);
        }

        public async Task<IEnumerable<DenominationRelation>> GetRelations(CancellationToken ct)
        {
            return await _context.Set<DenominationRelation>()
                .AsNoTracking()
                .ToListAsync(ct);
        }

        private DenominationTranslationEntity? SelectPreferredTranslation(IEnumerable<DenominationTranslationEntity> translations)
        {
            var culture = _cultureProvider.Culture;

            return translations.FirstOrDefault(t => t.Culture == culture)
                ?? translations.FirstOrDefault(t => t.Culture == Culture.enUS)
                ?? translations.FirstOrDefault();
        }

        private static void ApplyTranslation(Denomination denomination, DenominationTranslationEntity? translation)
        {
            if (translation is null)
                return;

            denomination.SetName(translation.Name);
            denomination.SetDescription(translation.Description);
            denomination.SetTenets(translation.Tenets);
            denomination.SetAppearance(translation.Appearance);
        }
    }
}
