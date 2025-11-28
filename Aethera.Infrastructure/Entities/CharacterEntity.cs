using Aethera.Domain.Common;
using Aethera.Domain.Entities.Basic;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure.Entities
{
    public class CharacterEntity : Entity, ILocalizableEntity<CharacterTranslationEntity>
    {
        // Classification (use domain enums)
        public Species Species { get; set; }
        public CharacterClass? Class { get; set; }
        public CharacterClass? SubClass { get; set; }
        public CharacterStatus? Status { get; set; }

        // Art reference (in infra we store Id referencing Art)
        public Art? Art { get; set; }

        // Leveling / experience
        public int Level { get; set; } = 1;
        public long? ExperiencePoints { get; set; } = 0;

        // Size/speed (speed is stored, Size is derived in domain so we keep only stored Speed)
        public int? Speed { get; set; }

        // Parentage & location
        public Guid? DynastyId { get; set; }
        public Guid? HometownId { get; set; }
        public Guid? FatherId { get; set; }
        public Guid? MotherId { get; set; }
        public Guid? BackgroundId { get; set; }

        // Alignment
        public Alignment? Alignment { get; set; }

        // --- Hit Points & Death Saves (use domain value objects)
        public HitPoints? HP { get; set; }
        public Dice? HitDice { get; set; }

        public int? DeathSaveSuccesses { get; set; }
        public int? DeathSaveFailures { get; set; }

        // --- Attributes (reuse domain value object)
        public AttributeScore Strength { get; set; } = new AttributeScore(10);
        public AttributeScore Dexterity { get; set; } = new AttributeScore(10);
        public AttributeScore Constitution { get; set; } = new AttributeScore(10);
        public AttributeScore Intelligence { get; set; } = new AttributeScore(10);
        public AttributeScore Wisdom { get; set; } = new AttributeScore(10);
        public AttributeScore Charisma { get; set; } = new AttributeScore(10);

        // --- Proficiencies and Saves
        // Keep Skill and Language enums from domain so they remain consistent
        public List<string> SavingThrowProficiencies { get; set; }
        public List<Skill> SkillProficiencies { get; set; }
        public List<Language> LanguageProficiencies { get; set; }

        // --- Heroic inspiration (non-translatable numeric)
        public int? HeroicInspirationCount { get; set; } = 0;

        // --- Equipment references
        public Guid? EquipedWeaponId { get; set; }
        public Guid? EquipedArmorId { get; set; }

        // Collections of related item/spell IDs to avoid embedding domain aggregates in infra

        private readonly List<Weapon> _weapons = [];
        private readonly List<Armor> _armors = [];
        private readonly List<Equipment> _equipments = [];
        private readonly List<Item> _items = [];
        private readonly List<Spell> _spells = [];

        public IReadOnlyCollection<Spell> Spells => _spells.AsReadOnly();
        public IReadOnlyCollection<Weapon> Weapons => _weapons.AsReadOnly();
        public IReadOnlyCollection<Armor> Armors => _armors.AsReadOnly();
        public IReadOnlyCollection<Equipment> Equipments => _equipments.AsReadOnly();
        public IReadOnlyCollection<Item> Items => _items.AsReadOnly();
        public virtual ICollection<CharacterTranslationEntity> Translations { get; set; }

        // Parameterless constructor - initialize collections for persistence frameworks
        public CharacterEntity()
        {
            SavingThrowProficiencies = new List<string>();
            SkillProficiencies = new List<Skill>();
            LanguageProficiencies = new List<Language>();
        }
    }
}
