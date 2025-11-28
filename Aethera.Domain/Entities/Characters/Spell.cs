using Aethera.Domain.Common;
using Aethera.Domain.Entities.Basic;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Characters
{
    public class Spell : Entity
    {
        public string? Name { get; private set; }
        public string? Description { get; private set; }
        public int? Level { get; set; } 
        public DiceExpression? HealingAmount { get; set; }
        public DiceExpression? DamageAmount { get; set; }
        protected Spell(string name, string description, int? level, DiceExpression healingAmount, DiceExpression damageAmount)
        {
            Name = name;
            Description = description;
            Level = level;
            HealingAmount = healingAmount;
            DamageAmount = damageAmount;
        }
        public Spell() { }
    }
}
