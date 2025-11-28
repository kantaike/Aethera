using System;
using System.Collections.Generic;
using System.Text;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Entities.Settlements;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Persistence;

namespace Aethera.Infrastructure.Repositories
{
    internal class SettlemmentRepository(ApplicationDbContext context) : Repository<Settlement>(context), ISettlementRepository
    {
    }
}
