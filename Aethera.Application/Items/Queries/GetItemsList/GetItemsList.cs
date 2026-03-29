using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Items.Queries.GetItemsList
{
    public record GetItemsQuery();
    public record ItemDto(Guid Id, string Name, string Type, decimal Cost, Art? Art);

    public class GetItemsHandler : IQueryHandler<GetItemsQuery, IEnumerable<ItemDto>>
    {
        private readonly IItemRepository _repository;

        public GetItemsHandler(IItemRepository repository) => _repository = repository;

        public async Task<IEnumerable<ItemDto>> HandleAsync(GetItemsQuery query, CancellationToken ct)
        {
            var items = await _repository.Get(ct);
            return items.Select(i => new ItemDto(
                i.Id,
                i.Name ?? "Unnamed",
                i.GetType().Name,
                i.Cost ?? 0,
                i.Art));
        }
    }
}
