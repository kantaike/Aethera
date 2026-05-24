using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Aethera.Domain.Common;
using Aethera.Domain.Entities.Settlements;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Entities;
using Aethera.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aethera.Infrastructure.Repositories
{
    internal class SettlemmentRepository(ApplicationDbContext context, ICultureProvider cultureProvider)
        : Repository<Settlement>(context, cultureProvider), ISettlementRepository
    {
        public override async Task Add(Settlement settlement, CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            await _context.Set<Settlement>().AddAsync(settlement, ct);

            var translationEntity = new SettlementTranslationEntity
            {
                Culture = culture,
                Title = settlement.Title,
                Description = settlement.Description,
                SettlementId = settlement.Id
            };

            _context.Set<SettlementTranslationEntity>().Add(translationEntity);
        }

        public override async Task<Settlement> Get(Guid id, CancellationToken ct)
        {
            var settlement = await _context.Set<Settlement>().FindAsync([id], ct)
                ?? throw new KeyNotFoundException($"Settlement with id {id} not found.");

            var translations = await _context.Set<SettlementTranslationEntity>()
                .Where(t => t.SettlementId == id)
                .ToListAsync(ct);

            ApplyTranslation(settlement, SelectPreferredTranslation(translations));

            return settlement;
        }

        public override async Task<IEnumerable<Settlement>> Get(CancellationToken ct)
        {
            var settlements = await _context.Set<Settlement>().AsNoTracking().ToListAsync(ct);
            var settlementIds = settlements.Select(s => s.Id).ToList();

            if (!settlementIds.Any())
                return settlements;

            var translations = await _context.Set<SettlementTranslationEntity>()
                .Where(t => settlementIds.Contains(t.SettlementId))
                .ToListAsync(ct);

            var translationMap = translations
                .GroupBy(t => t.SettlementId)
                .ToDictionary(g => g.Key, g => SelectPreferredTranslation(g));

            foreach (var settlement in settlements)
            {
                if (translationMap.TryGetValue(settlement.Id, out var translation))
                    ApplyTranslation(settlement, translation);
            }

            return settlements;
        }

        public async Task AddTranslation(Guid id, string? title, string? description)
        {
            var culture = _cultureProvider.Culture;

            var entity = await _context.Set<Settlement>().FindAsync(id)
                ?? throw new KeyNotFoundException($"Settlement with id {id} not found.");

            bool isTranslationExist = await _context.Set<SettlementTranslationEntity>()
                .AnyAsync(t => t.SettlementId == id && t.Culture == culture);

            if (isTranslationExist)
                throw new InvalidOperationException($"Translation for Settlement with id {id} already exists for culture {culture}.");

            var translationEntity = new SettlementTranslationEntity
            {
                Culture = culture,
                Title = title,
                Description = description,
                SettlementId = entity.Id
            };

            _context.Set<SettlementTranslationEntity>().Add(translationEntity);
        }

        public async Task UpsertTranslation(Guid id, string? title, string? description, CancellationToken ct)
        {
            var settlement = await Get(id, ct);
            var culture = _cultureProvider.Culture;

            var translation = await _context.Set<SettlementTranslationEntity>()
                .FirstOrDefaultAsync(t => t.SettlementId == id && t.Culture == culture, ct);

            if (translation is null)
            {
                translation = new SettlementTranslationEntity
                {
                    SettlementId = settlement.Id,
                    Culture = culture,
                    Title = title ?? settlement.Title,
                    Description = description ?? settlement.Description
                };

                _context.Set<SettlementTranslationEntity>().Add(translation);
                return;
            }

            translation.Title = title ?? translation.Title ?? settlement.Title;
            translation.Description = description;
        }

        private SettlementTranslationEntity? SelectPreferredTranslation(IEnumerable<SettlementTranslationEntity> translations)
        {
            var culture = _cultureProvider.Culture;

            return translations.FirstOrDefault(t => t.Culture == culture)
                ?? translations.FirstOrDefault(t => t.Culture == Culture.enUS)
                ?? translations.FirstOrDefault();
        }

        private static void ApplyTranslation(Settlement settlement, SettlementTranslationEntity? translation)
        {
            if (translation is null)
                return;

            if (translation.Title != null)
                settlement.SetTitle(translation.Title);
            if (translation.Description != null)
                settlement.SetDescription(translation.Description);
        }
    }
}
