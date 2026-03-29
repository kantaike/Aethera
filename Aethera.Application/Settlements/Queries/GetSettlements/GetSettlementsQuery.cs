using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Settlements.Queries.GetSettlements
{
    public record GetSettlementsQuery();
    public record SettlementDto(Guid Id, string Title, string Type, int Population, Art? Art, Guid? RulerId, Guid? ProvinceId);

    public class GetSettlementsHandler : IQueryHandler<GetSettlementsQuery, IEnumerable<SettlementDto>>
    {
        private readonly ISettlementRepository _repository;
        public GetSettlementsHandler(ISettlementRepository repository) => _repository = repository;

        public async Task<IEnumerable<SettlementDto>> HandleAsync(GetSettlementsQuery query, CancellationToken ct)
        {
            var settlements = await _repository.Get(ct);
            return settlements.Select(s => new SettlementDto(
                s.Id,
                s.Title ?? "Unknown",
                s.GetType().Name,
                s.Population ?? 0,
                s.Art,
                s.RulerId,
                s.ProvinceId));
        }
    }
}
