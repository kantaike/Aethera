using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Aethera.Domain.Common;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Entities;
using Aethera.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aethera.Infrastructure.Repositories
{
    internal class ItemRepository(ApplicationDbContext context, ICultureProvider cultureProvider)
        : Repository<Item>(context, cultureProvider), IItemRepository
    {
        public override async Task Add(Item item, CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            await _context.Set<Item>().AddAsync(item, ct);

            var translationEntity = new ItemTranslationEntity
            {
                Culture = culture,
                Name = item.Name,
                Description = item.Description,
                ItemId = item.Id
            };

            _context.Set<ItemTranslationEntity>().Add(translationEntity);
        }

        public override async Task<Item> Get(Guid id, CancellationToken ct)
        {
            var item = await _context.Set<Item>().FindAsync([id], ct)
                ?? throw new KeyNotFoundException($"Item with id {id} not found.");

            var translations = await _context.Set<ItemTranslationEntity>()
                .Where(t => t.ItemId == id)
                .ToListAsync(ct);

            ApplyTranslation(item, SelectPreferredTranslation(translations));

            return item;
        }

        public override async Task<IEnumerable<Item>> Get(CancellationToken ct)
        {
            var items = await _context.Set<Item>().AsNoTracking().ToListAsync(ct);
            var itemIds = items.Select(i => i.Id).ToList();

            if (!itemIds.Any())
                return items;

            var translations = await _context.Set<ItemTranslationEntity>()
                .Where(t => itemIds.Contains(t.ItemId))
                .ToListAsync(ct);

            var translationMap = translations
                .GroupBy(t => t.ItemId)
                .ToDictionary(g => g.Key, g => SelectPreferredTranslation(g));

            foreach (var item in items)
            {
                if (translationMap.TryGetValue(item.Id, out var translation))
                    ApplyTranslation(item, translation);
            }

            return items;
        }

        public async Task AddTranslation(Guid id, string? name, string? description)
        {
            var culture = _cultureProvider.Culture;

            var entity = await _context.Set<Item>().FindAsync(id)
                ?? throw new KeyNotFoundException($"Item with id {id} not found.");

            bool isTranslationExist = await _context.Set<ItemTranslationEntity>()
                .AnyAsync(t => t.ItemId == id && t.Culture == culture);

            if (isTranslationExist)
                throw new InvalidOperationException($"Translation for Item with id {id} already exists for culture {culture}.");

            var translationEntity = new ItemTranslationEntity
            {
                Culture = culture,
                Name = name,
                Description = description,
                ItemId = entity.Id
            };

            _context.Set<ItemTranslationEntity>().Add(translationEntity);
        }

        public async Task UpsertTranslation(Guid id, string? name, string? description, CancellationToken ct)
        {
            var item = await Get(id, ct);
            var culture = _cultureProvider.Culture;

            var translation = await _context.Set<ItemTranslationEntity>()
                .FirstOrDefaultAsync(t => t.ItemId == id && t.Culture == culture, ct);

            if (translation is null)
            {
                translation = new ItemTranslationEntity
                {
                    ItemId = item.Id,
                    Culture = culture,
                    Name = name ?? item.Name,
                    Description = description ?? item.Description
                };

                _context.Set<ItemTranslationEntity>().Add(translation);
                return;
            }

            translation.Name = name ?? translation.Name ?? item.Name;
            translation.Description = description;
        }

        private ItemTranslationEntity? SelectPreferredTranslation(IEnumerable<ItemTranslationEntity> translations)
        {
            var culture = _cultureProvider.Culture;

            return translations.FirstOrDefault(t => t.Culture == culture)
                ?? translations.FirstOrDefault(t => t.Culture == Culture.enUS)
                ?? translations.FirstOrDefault();
        }

        private static void ApplyTranslation(Item item, ItemTranslationEntity? translation)
        {
            if (translation is null)
                return;

            if (translation.Name != null)
                item.SetName(translation.Name);
            if (translation.Description != null)
                item.SetDescription(translation.Description);
        }
    }
}
