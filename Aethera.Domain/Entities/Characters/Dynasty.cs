using Aethera.Domain.Common;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Characters
{
    public class Dynasty : Entity, IHasArt
    {
        public string? Name { get; private set; }
        public string? Description { get; private set; }
        public string? Motto { get; private set; }
        public int? EstablishedYear { get; private set; }
        public Art? Art { get; private set; }
        public Dynasty(string name, string description)
        {
            Name = name;
            Description = description;
        }

        public void SetArt(Art art)
        {
            Art = art;
        }
    }
    public enum DynastyStatus
    {
        Ruling,
        Fallen,
        Vassal
    }   
}
