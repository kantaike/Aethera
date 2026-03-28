using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Aethera.Domain.Repositories
{
    public interface ISettlementRepository : IRepository<Entities.Settlements.Settlement>
    {
        Task<Entities.Settlements.Settlement> GetWithTranslation(Guid id, CancellationToken ct);
        Task<IEnumerable<Entities.Settlements.Settlement>> GetAllWithTranslation(CancellationToken ct);
        Task<Entities.Settlements.Settlement> AddWithTranslation(Entities.Settlements.Settlement settlement, CancellationToken ct);
        Task AddTranslation(Guid id, string? title, string? description);
    }
}
