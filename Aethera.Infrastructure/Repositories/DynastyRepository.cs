using Aethera.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure.Repositories
{
    internal class DynastyRepository(ApplicationDbContext context) : Repository<Domain.Entities.Characters.Dynasty>(context), Domain.Repositories.IDynastyRepository
    {
    }
}
