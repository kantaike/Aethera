using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Items
{
    public class Equipment(string? name, string? description, int? weight, decimal? cost) : Item(name, description, weight, cost)
    {
    }
}
