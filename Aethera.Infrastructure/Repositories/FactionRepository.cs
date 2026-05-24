using Aethera.Domain.Common;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Entities;
using Aethera.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aethera.Infrastructure.Repositories
{
    internal class FactionRepository(ApplicationDbContext context, ICultureProvider cultureProvider)
        : Repository<Faction>(context, cultureProvider), IFactionRepository
    {
        public override async Task Add(Faction faction, CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            await _context.Set<Faction>().AddAsync(faction, ct);

            var translationEntity = new FactionTranslationEntity
            {
                Culture = culture,
                Name = faction.Name,
                Description = faction.Description,
                FactionId = faction.Id
            };

            _context.Set<FactionTranslationEntity>().Add(translationEntity);
        }

        public override async Task<Faction> Get(Guid id, CancellationToken ct)
        {
            var faction = await _context.Set<Faction>().FindAsync([id], ct)
                ?? throw new KeyNotFoundException($"Faction with id {id} not found.");

            var translations = await _context.Set<FactionTranslationEntity>()
                .Where(t => t.FactionId == id)
                .ToListAsync(ct);

            ApplyTranslation(faction, SelectPreferredTranslation(translations));

            return faction;
        }

        public override async Task<IEnumerable<Faction>> Get(CancellationToken ct)
        {
            var factions = await _context.Set<Faction>().AsNoTracking().ToListAsync(ct);
            var factionIds = factions.Select(f => f.Id).ToList();

            if (!factionIds.Any())
                return factions;

            var translations = await _context.Set<FactionTranslationEntity>()
                .Where(t => factionIds.Contains(t.FactionId))
                .ToListAsync(ct);

            var translationMap = translations
                .GroupBy(t => t.FactionId)
                .ToDictionary(g => g.Key, g => SelectPreferredTranslation(g));

            foreach (var faction in factions)
            {
                if (translationMap.TryGetValue(faction.Id, out var translation))
                    ApplyTranslation(faction, translation);
            }

            return factions;
        }

        public async Task AddTranslation(Guid id, string? name, string? description)
        {
            var culture = _cultureProvider.Culture;

            var entity = await _context.Set<Faction>().FindAsync(id)
                ?? throw new KeyNotFoundException($"Faction with id {id} not found.");

            bool isTranslationExist = await _context.Set<FactionTranslationEntity>()
                .AnyAsync(t => t.FactionId == id && t.Culture == culture);

            if (isTranslationExist)
                throw new InvalidOperationException($"Translation for Faction with id {id} already exists for culture {culture}.");

            var translationEntity = new FactionTranslationEntity
            {
                Culture = culture,
                Name = name,
                Description = description,
                FactionId = entity.Id
            };

            _context.Set<FactionTranslationEntity>().Add(translationEntity);
        }

        public async Task UpsertTranslation(Guid id, string? name, string? description, CancellationToken ct)
        {
            var faction = await Get(id, ct);
            var culture = _cultureProvider.Culture;

            var translation = await _context.Set<FactionTranslationEntity>()
                .FirstOrDefaultAsync(t => t.FactionId == id && t.Culture == culture, ct);

            if (translation is null)
            {
                translation = new FactionTranslationEntity
                {
                    FactionId = faction.Id,
                    Culture = culture,
                    Name = name ?? faction.Name,
                    Description = description ?? faction.Description
                };

                _context.Set<FactionTranslationEntity>().Add(translation);
                return;
            }

            translation.Name = name ?? translation.Name ?? faction.Name;
            translation.Description = description;
        }

        public async Task UpsertRelation(Guid sourceId, Guid targetId, int value, string? context, CancellationToken ct)
        {
            var relation = await _context.Set<FactionRelation>()
                .FirstOrDefaultAsync(r => r.SourceId == sourceId && r.TargetId == targetId, ct);

            if (relation is null)
            {
                relation = new FactionRelation(sourceId, targetId, value, context);
                await _context.Set<FactionRelation>().AddAsync(relation, ct);
                return;
            }

            relation.Value = value;
            relation.Context = context;
        }

        public async Task<IEnumerable<FactionRelation>> GetRelations(Guid factionId, CancellationToken ct)
        {
            return await _context.Set<FactionRelation>()
                .Where(r => r.SourceId == factionId || r.TargetId == factionId)
                .AsNoTracking()
                .ToListAsync(ct);
        }

        private FactionTranslationEntity? SelectPreferredTranslation(IEnumerable<FactionTranslationEntity> translations)
        {
            var culture = _cultureProvider.Culture;

            return translations.FirstOrDefault(t => t.Culture == culture)
                ?? translations.FirstOrDefault(t => t.Culture == Culture.enUS)
                ?? translations.FirstOrDefault();
        }

        private static void ApplyTranslation(Faction faction, FactionTranslationEntity? translation)
        {
            if (translation is null)
                return;

            if (!string.IsNullOrWhiteSpace(translation.Name))
                faction.SetName(translation.Name);
            faction.SetDescription(translation.Description);
        }
    }
}
