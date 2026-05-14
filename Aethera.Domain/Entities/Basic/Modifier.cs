using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Basic
{
    public enum ModifierType { Flat, Multiplier, Override }
    public enum ModifierCategory { Base, Permanent, Equipment, Temporary }
    public enum ModifierSourceType { Character, Item, Status, Buff }
    public enum StatType 
    { 
        // Core Abilities
        Strength, 
        Dexterity, 
        Constitution, 
        Intelligence, 
        Wisdom, 
        Charisma,
        
        // Combat Stats
        ArmorClass, 
        Initiative, 
        Speed,
        
        // Hit Points & Health
        HitPoints,
        HitDice,
        
        // Proficiencies & Bonuses
        ProficiencyBonus,
        PassivePerception,
        
        // Saving Throws (individual)
        StrengthSave,
        DexteritySave,
        ConstitutionSave,
        IntelligenceSave,
        WisdomSave,
        CharismaSave,
        
        // Skills
        Acrobatics,
        AnimalHandling,
        Arcana,
        Athletics,
        Deception,
        History,
        Insight,
        Intimidation,
        Investigation,
        Medicine,
        Nature,
        Perception,
        Performance,
        Persuasion,
        Religion,
        SleightOfHand,
        Stealth,
        Survival
    }

    public class Modifier
    {
        public Modifier(
                        ModifierSourceType sourceType,
                        StatType statType,
                        ModifierType type,
                        ModifierCategory category,
                        double value,
                        int priority,
                        Guid? sourceId = null,
                        string? label = null)
        {
            SourceType = sourceType;
            StatType = statType;
            Type = type;
            Category = category;
            Value = value;
            Priority = priority;
            SourceId = sourceId;
            Label = label;
        }

        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? SourceId { get; set; } 
        public ModifierSourceType SourceType { get; set; }
        public string? Label { get; set; }  
        public StatType StatType { get; set; }
        public ModifierType Type { get; set; }
        public ModifierCategory Category { get; set; }
        public double Value { get; set; }
        public int Priority { get; set; }      // Override (0) -> Flat (100) -> Multiplier (200)
    }
}
