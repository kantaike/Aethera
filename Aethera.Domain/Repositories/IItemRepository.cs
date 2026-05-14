using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Aethera.Domain.Repositories
{
    public interface IItemRepository : IRepository<Entities.Items.Item>
    {
        Task AddTranslation(Guid id, string? name, string? description);
    }
}
