using Aethera.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Characters
{
    public class Faction : Entity
    {
        public Faction() { }
        public Faction(string name, string? description = null, Guid? denominationId = null, Guid? leaderId = null)
        {
            Name = name;
            Description = description;
            DenominationId = denominationId;
            LeaderId = leaderId;
        }
        public string Name { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public Guid? DenominationId { get; private set; }
        public Guid? LeaderId { get; private set; }

        public void SetName(string name)
        {
            Name = name;
        }

        public void SetDescription(string? description)
        {
            Description = description;
        }

        public void SetDenomination(Guid? denominationId)
        {
            DenominationId = denominationId;
        }

        public void SetLeader(Guid? leaderId)
        {
            LeaderId = leaderId;
        }

    }
}
