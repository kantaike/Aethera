using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Aethera.Domain.Repositories
{
    public interface IItemRepository : IRepository<Entities.Items.Item>
    {
        Task<Entities.Items.Item> GetWithTranslation(Guid id, CancellationToken ct);
        Task<IEnumerable<Entities.Items.Item>> GetAllWithTranslation(CancellationToken ct);
        Task<Entities.Items.Item> AddWithTranslation(Entities.Items.Item item, CancellationToken ct);
        Task AddTranslation(Guid id, string? name, string? description);
    }
}
