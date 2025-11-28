using Aethera.Domain.Entities.AdministrativeUnits;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure.Repositories
{
    public class AdministrativeUnitRepository(ApplicationDbContext context) : Repository<AdministrativeUnit>(context), IAdministrativeUnitRepository
    {
    }
}
