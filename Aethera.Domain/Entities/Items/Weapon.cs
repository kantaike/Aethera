using Aethera.Domain.Entities.Basic;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Items
{
    public class Weapon : Item
    {
        public DiceExpression? Damage { get; private set; }

        public Weapon(string? name, string? description, int? weight, decimal? cost, DiceExpression damage) : base(name, description, weight, cost)
        {
            Damage = damage;
        }
        public Weapon(string? name, string? description, int? weight, decimal? cost) : base(name, description, weight, cost)
        {
        }
    }
}
