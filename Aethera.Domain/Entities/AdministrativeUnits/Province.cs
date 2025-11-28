using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.AdministrativeUnits
{
    public class Province(string title, string? description,
        Guid? rulerId, Guid? parentId) : AdministrativeUnit(title, AdministrativeUnitType.Province, description, rulerId, parentId)
    {
    }
}
