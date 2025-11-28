using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.AdministrativeUnits
{
    public class Country(string title, string? description, 
        Guid? rulerId, Guid? parentId) : AdministrativeUnit(title, AdministrativeUnitType.Country, description, rulerId, parentId)
    {
    }
}
