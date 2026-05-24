using Aethera.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Characters
{
    public class Denomination : Entity
    {
        public string? Name { get; private set; }
        public string? Description { get; private set; }
        public string? Tenets { get; private set; } = null;
        public string? Appearance { get; private set; } = null;
        public Religion Religion { get; private set; }
        public Guid? LeaderId { get; private set; }
        public Denomination() { }

        public Denomination(string? name, string? description, string? tenets, string? appearance, Religion religion, Guid? leaderId = null)
        {
            Name = name;
            Description = description;
            Tenets = tenets;
            Appearance = appearance;
            Religion = religion;
            LeaderId = leaderId;
        }

        public void SetName(string? name)
        {
            Name = name;
        }

        public void SetDescription(string? description)
        {
            Description = description;
        }

        public void SetTenets(string? tenets)
        {
            Tenets = tenets;
        }

        public void SetAppearance(string? appearance)
        {
            Appearance = appearance;
        }

        public void SetReligion(Religion religion)
        {
            Religion = religion;
        }

        public void SetLeader(Guid? leaderId)
        {
            LeaderId = leaderId;
        }
    }

    public enum Religion
    {
        Sun,
        Moon,
        Heathen
    }
}
