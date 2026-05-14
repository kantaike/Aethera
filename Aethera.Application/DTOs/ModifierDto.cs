using Aethera.Domain.Entities.Basic;
using System;
using System.Collections.Generic;

namespace Aethera.Application.DTOs
{
    public class ModifierDto
    {
        public Guid Id { get; set; }
        public Guid? SourceId { get; set; }
        public string SourceType { get; set; } = string.Empty;
        public string? Label { get; set; }
        public string StatType { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public double Value { get; set; }
        public int Priority { get; set; }
    }

    public class ModifierBreakdownDto
    {
        public double BaseValue { get; set; }
        public double FinalValue { get; set; }
        public List<ModifierDto> Modifiers { get; set; } = new();
    }

    public class CharacterModifiersDto
    {
        public List<ModifierDto> PersonalModifiers { get; set; } = new();
        public List<ModifierDto> EquipmentModifiers { get; set; } = new();
        public Dictionary<string, ModifierBreakdownDto> StatBreakdown { get; set; } = new();
    }
}
