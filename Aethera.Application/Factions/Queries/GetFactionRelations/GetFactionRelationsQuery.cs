using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Factions.Queries.GetFactionRelations
{
    public record GetFactionRelationsQuery(Guid FactionId);
    public record FactionRelationDto(Guid SourceId, Guid TargetId, int Value, string? Context);

    public class GetFactionRelationsHandler(IFactionRepository repository)
        : IQueryHandler<GetFactionRelationsQuery, IEnumerable<FactionRelationDto>>
    {
        public async Task<IEnumerable<FactionRelationDto>> HandleAsync(GetFactionRelationsQuery query, CancellationToken ct)
        {
            var relations = await repository.GetRelations(query.FactionId, ct);

            return relations.Select(r => new FactionRelationDto(
                r.SourceId,
                r.TargetId,
                r.Value,
                r.Context));
        }
    }
}
