using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Items.Queries.GetItemDetails
{
    public record GetItemByIdQuery(Guid Id);
    public class GetItemByIdHandler : IQueryHandler<GetItemByIdQuery, Item?>
    {
        private readonly IItemRepository _repository;
        public GetItemByIdHandler(IItemRepository repository) => _repository = repository;

        public async Task<Item?> HandleAsync(GetItemByIdQuery query, CancellationToken ct)
            => await _repository.Get(query.Id, ct);
    }
}
