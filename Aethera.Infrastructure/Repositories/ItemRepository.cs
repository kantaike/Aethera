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
            var culture = _cultureProvider.Culture;

            var item = await _context.Set<Item>().FindAsync([id], ct)
                ?? throw new KeyNotFoundException($"Item with id {id} not found.");

            var translation = await _context.Set<ItemTranslationEntity>()
                .FirstOrDefaultAsync(t => t.ItemId == id && t.Culture == culture, ct);

            if (translation != null)
            {
                if (translation.Name != null)
                    item.SetName(translation.Name);
                if (translation.Description != null)
                    item.SetDescription(translation.Description);
            }

            return item;
        }

        public override async Task<IEnumerable<Item>> Get(CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;

            var items = await _context.Set<Item>().AsNoTracking().ToListAsync(ct);
            var itemIds = items.Select(i => i.Id).ToList();

            var translations = await _context.Set<ItemTranslationEntity>()
                .Where(t => itemIds.Contains(t.ItemId) && t.Culture == culture)
                .ToListAsync(ct);

            var translationMap = translations.ToDictionary(t => t.ItemId);

            foreach (var item in items)
            {
                if (translationMap.TryGetValue(item.Id, out var translation))
                {
                    if (translation.Name != null)
                        item.SetName(translation.Name);
                    if (translation.Description != null)
                        item.SetDescription(translation.Description);
                }
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
    }
}
