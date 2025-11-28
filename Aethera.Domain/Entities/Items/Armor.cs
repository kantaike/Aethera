using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Items
{
    public class Armor : Item
    {
        public Armor(string? name, string? description, int? weight, decimal? cost) : base(name, description, weight, cost) { }
        public Armor(string name, string description, int weight, decimal cost, int? armorModifier, ArmorType? type) : base(name, description, weight, cost)
        {
            ArmorModifier = armorModifier;
            Type = type;
        }
        public int? ArmorModifier { get; private set; }
        public ArmorType? Type { get; private set; }
    }
    public enum ArmorType
    {
        Light,
        Medium,
        Heavy
    }
}
