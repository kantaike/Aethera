using Aethera.Domain.Common;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Settlements
{
    public class Settlement : Entity, IHasArt
    {
        public string? Title { get; private set; } = string.Empty;
        public string? Description { get; private set; } = string.Empty;
        public int? Population {  get; private set; }
        public SettlementType? Type { get; private set; }
        public Guid? RulerId { get; private set; }
        public Guid? ProvinceId { get; private set; }
        public Art? Art { get; private set; }

        public Settlement(string title, string description) 
        {
            Title = title;
            Description = description;
        }
        public void SetPopulation(int population)
        {
            switch (population)
            {
                case < 0:
                    throw new ArgumentOutOfRangeException(nameof(population), "Population cannot be negative.");
                case > 1000000000:
                    throw new ArgumentOutOfRangeException(nameof(population), "Population exceeds maximum limit.");
            }
            Population = population;
        }
        public void SetRuler(Guid rulerId)
        {
            RulerId = rulerId;
        }
        public void SetProvince(Guid provinceId)
        {
            ProvinceId = provinceId;
        }

        public void SetArt(Art art)
        {
            Art = art;
        }
    }
    public enum SettlementType
    {
        City,
        Castle,
        Village
    }
}
