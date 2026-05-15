using System;
using System.Collections.Generic;
using System.Text;
using Aethera.Domain.Common;
using Aethera.Domain.Entities.Basic;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Services;
using Aethera.Domain.ValueObjects;

namespace Aethera.Domain.Entities.Characters
{
    public class Character : Entity, IHasArt
    {
        private Character()
        {
        }
        public Character(string? name, Species species, 
            CharacterClass? characterClass,
            int StrenghthScore = 10, int DexterityScore = 10, int ConstitutionScore = 10,
            int IntelligenceScore = 10, int WisdomScore = 10, int CharismaScore = 10,
            CharacterClass? characterSubClass = null


            )
        {
            // Basic identity
            Name = name;
            Species = species;
            Class = characterClass;
            SubClass = characterSubClass;

            // Core attributes
            Strength = new AttributeScore(StrenghthScore);
            Dexterity = new AttributeScore(DexterityScore);
            Constitution = new AttributeScore(ConstitutionScore);
            Intelligence = new AttributeScore(IntelligenceScore);
            Wisdom = new AttributeScore(WisdomScore);
            Charisma = new AttributeScore(CharismaScore);

            // Default speed by species (conservative defaults)
            Speed = species switch
            {
                Species.Halfling or Species.Gnome or Species.Dwarf => 25,
                Species.Human or Species.Elf or Species.Tiefling or Species.Dragonborn => 30,
                Species.Orc => 35,
                _ => 30
            };

            // Hit dice is unknown at construction; leave null but give a sensible first-level HP
            HitDice = null;
            var perLevelHp = (HitDice is not null) ? ((HitDice.Sides / 2) + 1) : 5;
            HP = new HitPoints(Level * perLevelHp, Level * perLevelHp, 0);

        }
        // --- Identity & Basics ---
        public string? Name { get; private set; } 
        public Species Species { get; private set; }
        public CharacterClass? Class { get; private set; }
        public CharacterClass? SubClass { get; private set; }
        public CharacterStatus? Status { get; private set; } 
        public Art? Art { get; private set; }
        public int Level { get; private set; } = 1;
        public long? ExperiencePoints { get; private set; } = 0;
        public Size Size => Species switch
        {
            Species.Halfling or Species.Gnome => Size.Small,
            Species.Dragonborn or Species.Dwarf or Species.Elf or Species.Human or Species.Tiefling => Size.Medium,
            Species.Orc => Size.Large,
            _ => throw new ArgumentOutOfRangeException()
        };
        public Alignment? Alignment { get; private set; }
        public Guid? DynastyId { get; private set; } 
        public Guid? HometownId { get; private set; }
        public Guid? FatherId { get; private set; }
        public Guid? MotherId { get; private set; }

        // --- Core Stats ---
        public int? ProficiencyBonus { get
            {
                return 2 + ((Level - 1) / 4);
            }
        } 
        public int? Initiative
        {
            get
            {
                return Dexterity?.Modifier;
            } 
        }
        public int? ArmorClass { get
            {
                var equipedArmor = _armors.FirstOrDefault(armor => armor.Id == EquipedArmorId);
                return 10 + equipedArmor?.ArmorModifier 
                    + equipedArmor?.Type == ArmorType.Light || equipedArmor?.Type == ArmorType.Medium
                    ? (Dexterity?.Modifier ?? 0)
                    : 0;
            }
        }
        public int? Speed { get; private set; }
        public int? PassivePerception
        {
            get
            {
                if (Wisdom is null) return null;
                return 10 + Wisdom.Modifier + (SkillProficiencies.Contains(Skill.Perception) ? (ProficiencyBonus ?? 0) : 0);
            }}

        // --- Hit Points & Death Saves ---
        public HitPoints? HP { get; private set; }
        public Dice? HitDice { get; private set; }

        public int? DeathSaveSuccesses { get; private set; }
        public int? DeathSaveFailures { get; private set; }

        // --- Attributes ---
        public AttributeScore Strength { get; private set; } = new AttributeScore(10);
        public AttributeScore Dexterity { get; private set; } = new AttributeScore(10);
        public AttributeScore Constitution { get; private set; } = new AttributeScore(10);
        public AttributeScore Intelligence { get; private set; } = new AttributeScore(10);
        public AttributeScore Wisdom { get; private set; } = new AttributeScore(10);
        public AttributeScore Charisma { get; private set; } = new AttributeScore(10);

        // --- Proficiencies and Saves ---
        public List<string> SavingThrowProficiencies { get; private set; } = [];
        public List<Skill> SkillProficiencies { get; private set; } = [];
        public List<Language> LanguageProficiencies { get; private set; } = [];

        // --- Traits & Features ---
        public string? Feats { get; private set; }
        public int? HeroicInspirationCount { get; private set; } = 0;
        public Background? Background { get; private set; }
        public string? Backstory { get; private set; }
        public string? Personality { get; private set; }

        // --- Equipment ---
        public Guid? EquipedWeaponId { get; private set; }
        public Guid? EquipedArmorId { get; private set; }

        // --- Modifiers ---
        public List<Modifier> Modifiers { get; private set; } = [];

        // --- Collections ---

        private readonly List<Armor> _armors = [];
        private readonly List<Equipment> _equipments = [];
        private readonly List<Item> _items = [];
        private readonly List<Spell> _spells = [];

        private readonly List<Weapon> _weapons = [];
        public IReadOnlyCollection<Weapon> Weapons => _weapons.AsReadOnly();
        public IReadOnlyCollection<Spell> Spells => _spells.AsReadOnly();
        public IReadOnlyCollection<Armor> Armors => _armors.AsReadOnly();
        public IReadOnlyCollection<Equipment> Equipments => _equipments.AsReadOnly();
        public IReadOnlyCollection<Item> Items => _items.AsReadOnly();

        public Guid? UserId { get; private set; }

        public void AssignToUser(Guid userId)
        {
            UserId = userId;
        }
        public void LevelUp(int levelCount = 1)
        {
            Level += levelCount;
        }

        public void UpdateHitPoints(int max, int current, int? temp = null)
        {
            HP = new HitPoints(max, current, temp);
        }
        public void UpdateHitPoints()
        {
            // Recalculate max HP based on hit dice, level, constitution modifier and any explicit modifiers that target HP.
            var level = Math.Max(1, Level);
            var conMod = Constitution?.Modifier ?? 0;

            // Average per-level HP (standard 5e convention): (sides / 2) + 1, fallback to 5 if HitDice unknown
            var perLevelHp = (HitDice is not null) ? ((HitDice.Sides / 2) + 1) : 5;

            // Ensure at least +1 HP per level (rolling/average + con mod cannot reduce below 1 per level)
            var perLevelGain = Math.Max(1, perLevelHp + conMod);

            // First level HP uses the hit die maximum
            var firstLevelHp = Math.Max(1, (HitDice?.Sides ?? perLevelHp) + conMod);

            var modifierBonus = Modifiers.Where(m => m.StatType == StatType.HitPoints).Sum(m => m.Value);
            var totalMax = firstLevelHp + (level - 1) * perLevelGain;


            // Ensure at least 1 max HP
            totalMax = Math.Max(1, totalMax);

            if (HP is null)
            {
                HP = new HitPoints(totalMax, totalMax, 0);
            }
            else
            {
                var current = HP.Current ?? totalMax;
                var temp = HP.Temp ?? 0;

                // Clamp current to new max
                if (current > totalMax) current = totalMax;
                if (current < 0) current = 0;

                HP = new HitPoints(totalMax, current, temp);
            }
        }
        public void AddItem(Item item)
        {
            switch (item)
            {
                case Weapon:
                    _weapons.Add((Weapon)item);
                    break;
                case Armor:
                    _armors.Add((Armor)item);
                    break;
                case Equipment:
                    _equipments.Add((Equipment)item);
                    break;
                default:
                    _items.Add(item);
                    break;
            }
        }
        public void EquipItem(Item item)
        {
            switch (item)
            {
                case Weapon weapon:
                    EquipedWeaponId = weapon.Id;
                    break;
                case Armor armor:
                    EquipedArmorId = armor.Id;
                    break;
                default:
                    throw new ArgumentException("Item type cannot be equipped");
            }
        }
        public void LearnSpell(Spell spell)
        {
            if (!_spells.Contains(spell))
            {
                _spells.Add(spell);
            }
        }

        public void UpdateTraitsAndFeatures(string? feats, int? heroicInspirationCount, string? backstory, string personality)
        {
            Feats = feats;
            HeroicInspirationCount = heroicInspirationCount;
            Backstory = backstory;
            Personality = personality;
        }
        public void AddSkillProficiency(Skill skill)
        {
            if (!SkillProficiencies.Contains(skill))
            {
                SkillProficiencies.Add(skill);
            }
        }
        public void AddLanguageProficiency(Language language)
        {
            if (!LanguageProficiencies.Contains(language))
            {
                LanguageProficiencies.Add(language);
            }
        }
        public void AddSavingThrowProficiency(string savingThrow)
        {
            if (!SavingThrowProficiencies.Contains(savingThrow))
            {
                SavingThrowProficiencies.Add(savingThrow);
            }
        }

        public void UpdateAttribute(string attributeName, int score)
        {
            var attributeScore = new AttributeScore(score);
            switch (attributeName.ToLower())
            {
                case "str":
                    Strength = attributeScore;
                    break;
                case "dex":
                    Dexterity = attributeScore;
                    break;
                case "con":
                    Constitution = attributeScore;
                    UpdateHitPoints();
                    break;
                case "int":
                    Intelligence = attributeScore;
                    break;
                case "wis":
                    Wisdom = attributeScore;
                    break;
                case "cha":
                    Charisma = attributeScore;
                    break;
                default:
                    throw new ArgumentException("Invalid attribute name");
            }
        }   

        public void UpdateSpeed(int speed)
        {
            Speed = speed;
        }

        public void UpdateHitDice(Dice hitDice)
        {
            HitDice = hitDice;
        }

        public void RecordDeathSave(bool isSuccess)
        {
            if (isSuccess)
            {
                DeathSaveSuccesses = (DeathSaveSuccesses ?? 0) + 1;
            }
            else
            {
                DeathSaveFailures = (DeathSaveFailures ?? 0) + 1;
            }
        }

        public void ResetDeathSaves()
        {
            DeathSaveSuccesses = 0;
            DeathSaveFailures = 0;
        }
        public void GainExperience(long experiencePoints)
        {
            ExperiencePoints = (ExperiencePoints ?? 0) + experiencePoints;

            var xp = ExperiencePoints ?? 0;

            // Standard D&D 5e cumulative XP thresholds for levels 1..20
            // Index 0 unused, index == level
            long[] xpThresholds = new long[]
            {
                0,      // 0 - unused
                0,      // Level 1
                300,    // Level 2
                900,    // Level 3
                2700,   // Level 4
                6500,   // Level 5
                14000,  // Level 6
                23000,  // Level 7
                34000,  // Level 8
                48000,  // Level 9
                64000,  // Level 10
                85000,  // Level 11
                100000, // Level 12
                120000, // Level 13
                140000, // Level 14
                165000, // Level 15
                195000, // Level 16
                225000, // Level 17
                265000, // Level 18
                305000, // Level 19
                355000  // Level 20
            };

            var prospectiveLevel = Level;
            while (prospectiveLevel < 20 && xp >= xpThresholds[prospectiveLevel + 1])
            {
                prospectiveLevel++;
            }

            var levelsToGain = prospectiveLevel - Level;
            if (levelsToGain > 0)
            {
                LevelUpService.LevelUpCharacter(this, levelsToGain);
            }
        }

        public void SetBackground(Background background)
        {
            if(Background != null) throw new ArgumentException("Only initial background setting is allowed. Background cannot be changed once set.");
            Background = background;
        }

        public void SetParents(Guid? fatherId, Guid? motherId)
        {
            if(fatherId == Id || motherId == Id)
            {
                throw new ArgumentException("Character can't be his own parent");
            }
            FatherId = fatherId;
            MotherId = motherId;
        }

        public void SetHometown(Guid hometownId)
        {
            HometownId = hometownId;
        }

        public void SetDynasty(Guid dynastyId)
        {
            DynastyId = dynastyId;
        }

        public void SetAlignment(Alignment alignment)
        {
            Alignment = alignment;
        }

        public void SetArt(Art art)
        {
            Art = art;
        }

        public void AddModifier(Modifier modifier)
        {
            if (modifier == null)
                throw new ArgumentNullException(nameof(modifier));
            
            modifier.SourceType = ModifierSourceType.Character;
            Modifiers = [.. Modifiers, modifier];
        }

        public void RemoveModifier(Guid modifierId)
        {
            Modifiers = [.. Modifiers.Where(m => m.Id != modifierId)];
        }

        public void ClearModifiers()
        {
            Modifiers = [];
        }

        // --- Translatable fields (set via repository after loading translation) ---
        public void ApplyTranslation(string? name, string? feats, string? backstory, string? personality)
        {
            if (name != null) Name = name;
            if (feats != null) Feats = feats;
            if (backstory != null) Backstory = backstory;
            if (personality != null) Personality = personality;
        }
    }
    public record AttributeScore(int Score)
    {
        public int Modifier => (Score - 10) / 2;
    }
    public record HitPoints(int? Max, int? Current, int? Temp);
    public record RelativeDto(Guid Id, string FullName, string Role, Guid? FatherId, Guid? MotherId);
    public enum Species
    {
        Human,
        Elf,
        Dwarf,
        Halfling,
        Orc,
        Gnome,
        Tiefling,
        Dragonborn
    }
    public enum CharacterStatus
    {
        Alive,
        Dead,
        Unknown
    }
    public enum CharacterClass
    {
        Fighter,
        Wizard,
        Rogue,
        Cleric,
        Ranger,
        Paladin,
        Bard,
        Warlock,
        Sorcerer,
        Druid,
        Monk,
        Barbarian
    }
    public enum Language
    {
        Common,
        Dwarvish,
        Elvish,
        Giant,
        Gnomish,
        Goblin,
        Halfling,
        Orcish,
        Abyssal,
        Celestial,
        Draconic,
        DeepSpeech,
        Infernal,
        Primordial,
        Sylvan,
        Undercommon
    }
    public enum Background
    {
        Acolyte,
        Charlatan,
        Criminal,
        Entertainer,
        FolkHero,
        GuildArtisan,
        Hermit,
        Noble,
        Outlander,
        Sage,
        Sailor,
        Soldier,
        Urchin
    }
    public enum Skill
    {
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
    public enum Size
    {
        Tiny,
        Small,
        Medium,
        Large,
        Huge,
        Gargantuan
    }
    public enum Alignment
    {
        LawfulGood,
        NeutralGood,
        ChaoticGood,
        LawfulNeutral,
        TrueNeutral,
        ChaoticNeutral,
        LawfulEvil,
        NeutralEvil,
        ChaoticEvil
    }
    public enum SpellcastingAbility
    {
        Strength,
        Dexterity,
        Constitution,
        Intelligence,
        Wisdom,
        Charisma
    }
}
