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
        public async Task<Settlement> AddWithTranslation(Settlement settlement, CancellationToken ct)
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

            return settlement;
        }

        public async Task<Settlement> GetWithTranslation(Guid id, CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            var settlement = await _context.Set<Settlement>().FindAsync([id], ct)
                ?? throw new KeyNotFoundException($"Settlement with id {id} not found.");

            var translation = await _context.Set<SettlementTranslationEntity>()
                .FirstOrDefaultAsync(t => t.SettlementId == id && t.Culture == culture, ct);

            if (translation != null)
            {
                if (translation.Title != null)
                    settlement.SetTitle(translation.Title);
                if (translation.Description != null)
                    settlement.SetDescription(translation.Description);
            }

            return settlement;
        }

        public async Task<IEnumerable<Settlement>> GetAllWithTranslation(CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            var settlements = await _context.Set<Settlement>().AsNoTracking().ToListAsync(ct);
            var settlementIds = settlements.Select(s => s.Id).ToList();

            var translations = await _context.Set<SettlementTranslationEntity>()
                .Where(t => settlementIds.Contains(t.SettlementId) && t.Culture == culture)
                .ToListAsync(ct);

            var translationMap = translations.ToDictionary(t => t.SettlementId);

            foreach (var settlement in settlements)
            {
                if (translationMap.TryGetValue(settlement.Id, out var translation))
                {
                    if (translation.Title != null)
                        settlement.SetTitle(translation.Title);
                    if (translation.Description != null)
                        settlement.SetDescription(translation.Description);
                }
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
    }
}
