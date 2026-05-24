using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Aethera.Domain.Repositories
{
    public interface IDynastyRepository : IRepository<Entities.Characters.Dynasty>
    {
        Task AddTranslation(Guid id, string? name, string? description, string? motto);
        Task UpsertTranslation(Guid id, string? name, string? description, string? motto, CancellationToken ct);
    }
}
