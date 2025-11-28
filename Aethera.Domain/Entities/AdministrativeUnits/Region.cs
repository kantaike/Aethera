using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.AdministrativeUnits
{
    public class Region(string title, string? description,
        Guid? rulerId, Guid? parentId) : AdministrativeUnit(title, AdministrativeUnitType.Region, description, rulerId, parentId)
    {
    }
}
