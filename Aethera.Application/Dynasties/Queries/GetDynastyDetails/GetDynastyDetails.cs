using Aethera.Application.Common.Interfaces;
using Aethera.Application.Dynasties.Queries.GetDynasties;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Dynasties.Queries.GetDynastyById
{
    public record GetDynastyByIdQuery(Guid Id);
    public record DynastyDetails(Guid Id, string Name, string Description, Art? Art, string? Motto, int? EstablishedYear, int? Power, DynastyStatus? Status);
    public class GetDynastyByIdHandler(IDynastyRepository repository, ICharacterRepository characterRepository,
        IAdministrativeUnitRepository administrativeUnitRepository, ISettlementRepository settlementRepository) : IQueryHandler<GetDynastyByIdQuery, DynastyDto?>
    {

        public async Task<DynastyDto?> HandleAsync(GetDynastyByIdQuery query, CancellationToken ct)
        {
            var dynasty = await repository.Get(query.Id, ct);
            var derived = await DynastyCalculator.CalculateAsync(dynasty,
                                                                      characterRepository,
                                                                      administrativeUnitRepository,
                                                                      settlementRepository,
                                                                      ct);
            return dynasty == null ? null : new DynastyDto(dynasty.Id, dynasty.Name ?? "", dynasty.Description ?? "", dynasty.Art, dynasty.Motto, dynasty.EstablishedYear, derived.TotalPower, derived.Status);
        }
    }
}
