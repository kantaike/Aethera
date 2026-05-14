using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Aethera.Domain.Common;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Entities;
using Aethera.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aethera.Infrastructure.Repositories
{
    internal class DynastyRepository(ApplicationDbContext context, ICultureProvider cultureProvider)
        : Repository<Dynasty>(context, cultureProvider), IDynastyRepository
    {
        public override async Task Add(Dynasty dynasty, CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            await _context.Set<Dynasty>().AddAsync(dynasty, ct);

            var translationEntity = new DynastyTranslationEntity
            {
                Culture = culture,
                Name = dynasty.Name,
                Description = dynasty.Description,
                Motto = dynasty.Motto,
                DynastyId = dynasty.Id
            };

            _context.Set<DynastyTranslationEntity>().Add(translationEntity);
        }

        public override async Task<Dynasty> Get(Guid id, CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            var dynasty = await _context.Set<Dynasty>().FindAsync([id], ct)
                ?? throw new KeyNotFoundException($"Dynasty with id {id} not found.");

            var translation = await _context.Set<DynastyTranslationEntity>()
                .FirstOrDefaultAsync(t => t.DynastyId == id && t.Culture == culture, ct);

            if (translation != null)
            {
                if (translation.Name != null)
                    dynasty.SetName(translation.Name);
                if (translation.Description != null)
                    dynasty.SetDescription(translation.Description);
                if (translation.Motto != null)
                    dynasty.SetMotto(translation.Motto);
            }

            return dynasty;
        }

        public override async Task<IEnumerable<Dynasty>> Get(CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            var dynasties = await _context.Set<Dynasty>().AsNoTracking().ToListAsync(ct);
            var dynastyIds = dynasties.Select(d => d.Id).ToList();

            var translations = await _context.Set<DynastyTranslationEntity>()
                .Where(t => dynastyIds.Contains(t.DynastyId) && t.Culture == culture)
                .ToListAsync(ct);

            var translationMap = translations.ToDictionary(t => t.DynastyId);

            foreach (var dynasty in dynasties)
            {
                if (translationMap.TryGetValue(dynasty.Id, out var translation))
                {
                    if (translation.Name != null)
                        dynasty.SetName(translation.Name);
                    if (translation.Description != null)
                        dynasty.SetDescription(translation.Description);
                    if (translation.Motto != null)
                        dynasty.SetMotto(translation.Motto);
                }
            }

            return dynasties;
        }

        public async Task AddTranslation(Guid id, string? name, string? description, string? motto)
        {
            var culture = _cultureProvider.Culture;

            var entity = await _context.Set<Dynasty>().FindAsync(id)
                ?? throw new KeyNotFoundException($"Dynasty with id {id} not found.");

            bool isTranslationExist = await _context.Set<DynastyTranslationEntity>()
                .AnyAsync(t => t.DynastyId == id && t.Culture == culture);

            if (isTranslationExist)
                throw new InvalidOperationException($"Translation for Dynasty with id {id} already exists for culture {culture}.");

            var translationEntity = new DynastyTranslationEntity
            {
                Culture = culture,
                Name = name,
                Description = description,
                Motto = motto,
                DynastyId = entity.Id
            };

            _context.Set<DynastyTranslationEntity>().Add(translationEntity);
        }
    }
}
