using Aethera.Domain.Entities.Characters;

namespace Aethera.Domain.Repositories
{
    public interface IDenominationRepository : IRepository<Denomination>
    {
        Task AddTranslation(Guid id, string? name, string? description, string? tenets, string? appearance);
        Task UpsertTranslation(Guid id, string? name, string? description, string? tenets, string? appearance, CancellationToken ct);
        Task UpsertRelation(Guid sourceId, Guid targetId, int value, string? context, CancellationToken ct);
        Task<IEnumerable<DenominationRelation>> GetRelations(Guid denominationId, CancellationToken ct);
        Task<IEnumerable<DenominationRelation>> GetRelations(CancellationToken ct);
    }
}
