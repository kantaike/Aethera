using Aethera.Application.Common.Interfaces;
using Aethera.Application.Factions.Queries.GetFactions;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Factions.Queries.GetFactionDetails
{
    public record GetFactionDetailsQuery(Guid Id);

    public class GetFactionDetailsHandler(IFactionRepository repository)
        : IQueryHandler<GetFactionDetailsQuery, FactionDto?>
    {
        public async Task<FactionDto?> HandleAsync(GetFactionDetailsQuery query, CancellationToken ct)
        {
            var faction = await repository.Get(query.Id, ct);

            return new FactionDto(
                faction.Id,
                faction.Name,
                faction.Description,
                faction.DenominationId,
                faction.LeaderId);
        }
    }
}
