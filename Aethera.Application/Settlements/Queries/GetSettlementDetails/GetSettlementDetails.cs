using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Settlements;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Settlements.Queries.GetSettlementDetails
{
    public record GetSettlementByIdQuery(Guid Id);
    public class GetSettlementByIdHandler : IQueryHandler<GetSettlementByIdQuery, Settlement?>
    {
        private readonly ISettlementRepository _repository;
        public GetSettlementByIdHandler(ISettlementRepository repository) => _repository = repository;

        public async Task<Settlement?> HandleAsync(GetSettlementByIdQuery query, CancellationToken ct)
            => await _repository.Get(query.Id, ct);
    }
}
