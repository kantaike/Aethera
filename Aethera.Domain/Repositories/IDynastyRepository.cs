using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Aethera.Domain.Repositories
{
    public interface IDynastyRepository : IRepository<Entities.Characters.Dynasty>
    {
        Task<Entities.Characters.Dynasty> GetWithTranslation(Guid id, CancellationToken ct);
        Task<IEnumerable<Entities.Characters.Dynasty>> GetAllWithTranslation(CancellationToken ct);
        Task<Entities.Characters.Dynasty> AddWithTranslation(Entities.Characters.Dynasty dynasty, CancellationToken ct);
        Task AddTranslation(Guid id, string? name, string? description, string? motto);
    }
}
