using Aethera.Domain.Common;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Items
{
    public class Item : Entity, IHasArt
    {
        public string? Name { get; protected set; }
        public string? Description { get; protected set; }
        public int? Weight { get; protected set; }
        public decimal? Cost { get; protected set; }
        public Art? Art { get; private set; }

        public Item(string? name, string? description, int? weight, decimal? cost)
        {
            Name = name;
            Description = description;
            Weight = weight;
            Cost = cost;
        }

        public void SetArt(Art art)
        {
            Art = art;
        }
    }
    public enum ItemType
    {
        Item,
        Weapon,
        Armor,
        Equipment
    }
}
