using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Aethera.Application.Common.Interfaces;
using Aethera.Application.DTOs;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Items.Queries.GetItemModifiers
{
    public record GetItemModifiersQuery(Guid ItemId);

    public class GetItemModifiersHandler : IQueryHandler<GetItemModifiersQuery, List<ModifierDto>>
    {
        private readonly IItemRepository _itemRepository;

        public GetItemModifiersHandler(IItemRepository itemRepository)
        {
            _itemRepository = itemRepository;
        }

        public async Task<List<ModifierDto>> HandleAsync(GetItemModifiersQuery query, CancellationToken ct)
        {
            var item = await _itemRepository.Get(query.ItemId, ct);
            if (item == null)
                throw new ArgumentException($"Item with ID {query.ItemId} not found");

            var result = item.Modifiers.Select(m => new ModifierDto
            {
                Id = m.Id,
                SourceId = m.SourceId,
                SourceType = m.SourceType.ToString(),
                Label = m.Label,
                StatType = m.StatType.ToString(),
                Type = m.Type.ToString(),
                Category = m.Category.ToString(),
                Value = m.Value,
                Priority = m.Priority
            }).ToList();

            return await Task.FromResult(result);
        }
    }
}
