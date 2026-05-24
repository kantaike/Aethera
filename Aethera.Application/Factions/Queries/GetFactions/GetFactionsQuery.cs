using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Factions.Queries.GetFactions
{
    public record GetFactionsQuery();
    public record FactionDto(Guid Id, string Name, string? Description, Guid? DenominationId, Guid? LeaderId);

    public class GetFactionsHandler(IFactionRepository repository)
        : IQueryHandler<GetFactionsQuery, IEnumerable<FactionDto>>
    {
        public async Task<IEnumerable<FactionDto>> HandleAsync(GetFactionsQuery query, CancellationToken ct)
        {
            var factions = await repository.Get(ct);

            return factions.Select(f => new FactionDto(
                f.Id,
                f.Name,
                f.Description,
                f.DenominationId,
                f.LeaderId));
        }
    }
}
