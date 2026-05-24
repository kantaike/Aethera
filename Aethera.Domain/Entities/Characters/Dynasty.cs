using Aethera.Domain.Common;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Characters
{
    public class Dynasty : Entity, IHasArt
    {
        private Dynasty()
        {
        }

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

        public void SetName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Dynasty name cannot be empty.", nameof(name));
            Name = name;
        }

        public void SetDescription(string description)
        {
            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("Dynasty description cannot be empty.", nameof(description));
            Description = description;
        }

        public void SetMotto(string motto)
        {
            if (string.IsNullOrWhiteSpace(motto))
                throw new ArgumentException("Motto cannot be empty.", nameof(motto));
            Motto = motto;
        }

        public void SetEstablishedYear(int year)
        {
            EstablishedYear = year;
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
