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
            var dynasty = await _context.Set<Dynasty>().FindAsync([id], ct)
                ?? throw new KeyNotFoundException($"Dynasty with id {id} not found.");

            var translations = await _context.Set<DynastyTranslationEntity>()
                .Where(t => t.DynastyId == id)
                .ToListAsync(ct);

            ApplyTranslation(dynasty, SelectPreferredTranslation(translations));

            return dynasty;
        }

        public override async Task<IEnumerable<Dynasty>> Get(CancellationToken ct)
        {
            var dynasties = await _context.Set<Dynasty>().AsNoTracking().ToListAsync(ct);
            var dynastyIds = dynasties.Select(d => d.Id).ToList();

            if (!dynastyIds.Any())
                return dynasties;

            var translations = await _context.Set<DynastyTranslationEntity>()
                .Where(t => dynastyIds.Contains(t.DynastyId))
                .ToListAsync(ct);

            var translationMap = translations
                .GroupBy(t => t.DynastyId)
                .ToDictionary(g => g.Key, g => SelectPreferredTranslation(g));

            foreach (var dynasty in dynasties)
            {
                if (translationMap.TryGetValue(dynasty.Id, out var translation))
                    ApplyTranslation(dynasty, translation);
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

        public async Task UpsertTranslation(Guid id, string? name, string? description, string? motto, CancellationToken ct)
        {
            var dynasty = await Get(id, ct);
            var culture = _cultureProvider.Culture;

            var translation = await _context.Set<DynastyTranslationEntity>()
                .FirstOrDefaultAsync(t => t.DynastyId == id && t.Culture == culture, ct);

            if (translation is null)
            {
                translation = new DynastyTranslationEntity
                {
                    DynastyId = dynasty.Id,
                    Culture = culture,
                    Name = name ?? dynasty.Name,
                    Description = description ?? dynasty.Description,
                    Motto = motto ?? dynasty.Motto
                };

                _context.Set<DynastyTranslationEntity>().Add(translation);
                return;
            }

            translation.Name = name ?? translation.Name ?? dynasty.Name;
            translation.Description = description;
            translation.Motto = motto;
        }

        private DynastyTranslationEntity? SelectPreferredTranslation(IEnumerable<DynastyTranslationEntity> translations)
        {
            var culture = _cultureProvider.Culture;

            return translations.FirstOrDefault(t => t.Culture == culture)
                ?? translations.FirstOrDefault(t => t.Culture == Culture.enUS)
                ?? translations.FirstOrDefault();
        }

        private static void ApplyTranslation(Dynasty dynasty, DynastyTranslationEntity? translation)
        {
            if (translation is null)
                return;

            if (translation.Name != null)
                dynasty.SetName(translation.Name);
            if (translation.Description != null)
                dynasty.SetDescription(translation.Description);
            if (translation.Motto != null)
                dynasty.SetMotto(translation.Motto);
        }
    }
}
