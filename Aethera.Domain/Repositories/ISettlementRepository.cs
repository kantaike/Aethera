using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Aethera.Domain.Repositories
{
    public interface ISettlementRepository : IRepository<Entities.Settlements.Settlement>
    {
        Task AddTranslation(Guid id, string? title, string? description);
    }
}
