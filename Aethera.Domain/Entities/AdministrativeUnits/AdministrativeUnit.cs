using Aethera.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.AdministrativeUnits
{
    public abstract class AdministrativeUnit : Entity
    {
        public string? Title { get; private set; } = string.Empty;
        public string? Description { get; private set; } = string.Empty;
        public AdministrativeUnitType Type { get; private set; }
        public Guid? RulerId { get; private set; }
        public Guid? ParentId { get; private set; }
        public void SetRuler(Guid rulerId)
        {
            RulerId = rulerId;
        }
        public void SetParent(Guid parentId)
        {
            ParentId = parentId;
        }
        public void UpdateDetails(string title, string? description)
        {
            Title = title;
            Description = description;
        }
        protected AdministrativeUnit(string title, AdministrativeUnitType type, string? description, 
            Guid? rulerId, Guid? parentId) 
        {
            Title = title;
            Type = type;
            Description = description;
            RulerId = rulerId;
            ParentId = parentId;
        }
    }
    public enum AdministrativeUnitType
    {
        Country,
        Region,
        Province
    }
}
