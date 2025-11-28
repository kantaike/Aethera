using System;
using System.Collections.Generic;
using System.Text;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Persistence;

namespace Aethera.Infrastructure.Repositories
{
    internal class ItemRepository(ApplicationDbContext context) : Repository<Item>(context), IItemRepository
    {
    }
}
