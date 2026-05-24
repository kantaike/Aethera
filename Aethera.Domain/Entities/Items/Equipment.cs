using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Items
{
    public class Equipment : Item
    {
        private Equipment()
        {
        }

        public Equipment(string? name, string? description, int? weight, decimal? cost) : base(name, description, weight, cost)
        {
        }
    }
}
