using Aethera.Domain.Entities.Characters;

namespace Aethera.Domain.Repositories
{
    public interface IFactionRepository : IRepository<Faction>
    {
        Task AddTranslation(Guid id, string? name, string? description);
        Task UpsertTranslation(Guid id, string? name, string? description, CancellationToken ct);
        Task UpsertRelation(Guid sourceId, Guid targetId, int value, string? context, CancellationToken ct);
        Task<IEnumerable<FactionRelation>> GetRelations(Guid factionId, CancellationToken ct);
    }
}
