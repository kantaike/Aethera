using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Denominations.Queries.GetDenominationRelations
{
    public record GetDenominationRelationsQuery(Guid DenominationId);
    public record GetAllDenominationRelationsQuery();
    public record DenominationRelationDto(Guid SourceId, Guid TargetId, int Value, string? Context);

    public class GetDenominationRelationsHandler(IDenominationRepository repository)
        : IQueryHandler<GetDenominationRelationsQuery, IEnumerable<DenominationRelationDto>>
    {
        public async Task<IEnumerable<DenominationRelationDto>> HandleAsync(GetDenominationRelationsQuery query, CancellationToken ct)
        {
            var relations = await repository.GetRelations(query.DenominationId, ct);

            return relations.Select(r => new DenominationRelationDto(
                r.SourceId,
                r.TargetId,
                r.Value,
                r.Context));
        }
    }

    public class GetAllDenominationRelationsHandler(IDenominationRepository repository)
        : IQueryHandler<GetAllDenominationRelationsQuery, IEnumerable<DenominationRelationDto>>
    {
        public async Task<IEnumerable<DenominationRelationDto>> HandleAsync(GetAllDenominationRelationsQuery query, CancellationToken ct)
        {
            var relations = await repository.GetRelations(ct);

            return relations.Select(r => new DenominationRelationDto(
                r.SourceId,
                r.TargetId,
                r.Value,
                r.Context));
        }
    }
}
