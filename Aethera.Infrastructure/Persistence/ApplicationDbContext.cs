using Aethera.Domain.Entities.AdministrativeUnits;
using Aethera.Domain.Entities.Basic;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Entities.Settlements;
using Aethera.Domain.Entities.Users;
using Aethera.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using static System.Net.Mime.MediaTypeNames;

namespace Aethera.Infrastructure.Persistence
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        // -- Characters --
        public DbSet<CharacterEntity> CharacterEntities { get; set; }
        public DbSet<CharacterTranslationEntity> CharacterTranslationEntities { get; set; }
        public DbSet<Dynasty> Dynasties { get; set; }
        public DbSet<Spell> Spells { get; set; }
        public DbSet<Religion> Religions { get; set; }

        // -- Items --
        public DbSet<Item> Items { get; set; }
        public DbSet<Weapon> Weapons { get; set; }
        public DbSet<Equipment> Equipments { get; set; }
        public DbSet<Armor> Armors { get; set; }

        // -- Settlements --
        public DbSet<Settlement> Settlements { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<Castle> Castles { get; set; }
        public DbSet<Village> Villages { get; set; }

        // -- Administrative units --
        public DbSet<Country> Countries { get; set; }
        public DbSet<Region> Regions { get; set; }
        public DbSet<Province> Provinces { get; set; }

        // -- Users --
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // -- Characters --
            modelBuilder.Entity<CharacterEntity>(entity =>
            {
                entity.ToTable("Characters");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                    .HasDefaultValueSql("gen_random_uuid()");
                entity.OwnsOne(e => e.HP, hp =>
                {
                    hp.Property(p => p.Current).HasColumnName("HP_Current");
                    hp.Property(p => p.Max).HasColumnName("HP_Maximum");
                    hp.Property(p => p.Temp).HasColumnName("HP_Temporary");
                });
                entity.OwnsOne(e=>e.HitDice, hd =>
                {
                    hd.Property(p => p.Sides).HasColumnName("HitDice_DiceSides");
                });
                entity.OwnsOne(e => e.Strength, attr =>
                {
                    attr.Property(p => p.Score).HasColumnName("Strength_Score");
                });
                entity.OwnsOne(e => e.Dexterity, attr =>
                {
                    attr.Property(p => p.Score).HasColumnName("Dexterity_Score");
                });
                entity.OwnsOne(e => e.Constitution, attr =>
                {
                    attr.Property(p => p.Score).HasColumnName("Constitution_Score");
                });
                entity.OwnsOne(e => e.Intelligence, attr =>
                {
                    attr.Property(p => p.Score).HasColumnName("Intelligence_Score");
                });
                entity.OwnsOne(e => e.Wisdom, attr =>
                {
                    attr.Property(p => p.Score).HasColumnName("Wisdom_Score");
                });
                entity.OwnsOne(e => e.Charisma, attr =>
                {
                    attr.Property(p => p.Score).HasColumnName("Charisma_Score");
                });
                entity.HasOne<Dynasty>()
                      .WithMany()
                      .HasForeignKey(e => e.DynastyId)
                      .OnDelete(DeleteBehavior.SetNull);
                entity.HasOne<Settlement>()
                      .WithMany()
                      .HasForeignKey(e => e.HometownId)
                      .OnDelete(DeleteBehavior.SetNull);
                entity.HasOne<CharacterEntity>()
                      .WithMany()
                      .HasForeignKey(e => e.FatherId)
                      .OnDelete(DeleteBehavior.SetNull);
                entity.HasOne<CharacterEntity>()
                      .WithMany()
                      .HasForeignKey(e => e.MotherId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(c => c.Spells)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "CharacterSpells",
                    j => j.HasOne<Spell>().WithMany().HasForeignKey("SpellId"),
                    j => j.HasOne<CharacterEntity>().WithMany().HasForeignKey("CharacterId"));

                entity.HasMany(c => c.Weapons)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "CharacterWeapons",
                    j => j.HasOne<Weapon>().WithMany().HasForeignKey("WeaponId"),
                    j => j.HasOne<CharacterEntity>().WithMany().HasForeignKey("CharacterId"));

                entity.HasMany(c => c.Armors)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "CharacterArmors",
                    j => j.HasOne<Armor>().WithMany().HasForeignKey("ArmorId"),
                    j => j.HasOne<CharacterEntity>().WithMany().HasForeignKey("CharacterId"));

                entity.HasMany(c => c.Equipments)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "CharacterEquipments",
                    j => j.HasOne<Equipment>().WithMany().HasForeignKey("EquipmentId"),
                    j => j.HasOne<CharacterEntity>().WithMany().HasForeignKey("CharacterId"));

                entity.HasMany(c => c.Items)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "CharacterItems",
                    j => j.HasOne<Item>().WithMany().HasForeignKey("ItemId"),
                    j => j.HasOne<CharacterEntity>().WithMany().HasForeignKey("CharacterId"));
                entity.Navigation(c => c.Spells).UsePropertyAccessMode(PropertyAccessMode.Field);
                entity.Navigation(c => c.Weapons).UsePropertyAccessMode(PropertyAccessMode.Field);
                entity.Navigation(c => c.Armors).UsePropertyAccessMode(PropertyAccessMode.Field);
                entity.Navigation(c => c.Equipments).UsePropertyAccessMode(PropertyAccessMode.Field);
                entity.Navigation(c => c.Items).UsePropertyAccessMode(PropertyAccessMode.Field);

                entity.OwnsOne(c => c.Art, art =>
                {
                    art.Property(a => a.FilePath)
                       .HasColumnName("Art_FilePath")
                       .HasMaxLength(500)
                       .IsRequired(false);
                });
                entity.HasMany(e => e.Translations).WithOne()
                      .HasForeignKey(e => e.CharacterId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CharacterTranslationEntity>(entity =>
            {
                entity.ToTable("CharacterTranslations");
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => new { e.CharacterId, e.Culture })
                      .IsUnique();

                entity.Property(e => e.Culture)
                      .IsRequired()
                      .HasMaxLength(10);

                entity.Property(e => e.Name).IsRequired();
            });

            modelBuilder.Entity<Dynasty>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.OwnsOne(c => c.Art, art =>
                {
                    art.Property(a => a.FilePath)
                       .HasColumnName("Art_FilePath")
                       .HasMaxLength(500)
                       .IsRequired(false);
                });
            });

            modelBuilder.Entity<Spell>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.OwnsOne(e => e.DamageAmount, damage =>
                {
                    damage.Property(p => p.DiceCount).HasColumnName("Damage_DiceCount");
                    damage.Property(p => p.DiceSides).HasColumnName("Damage_DiceSides");
                    damage.Property(p => p.ConstantModifier).HasColumnName("Damage_ConstantModifier");
                });
                entity.OwnsOne(e => e.HealingAmount, healing =>
                {
                    healing.Property(p => p.DiceCount).HasColumnName("Healing_DiceCount");
                    healing.Property(p => p.DiceSides).HasColumnName("Healing_DiceSides");
                    healing.Property(p => p.ConstantModifier).HasColumnName("Healing_ConstantModifier");
                });
            });

            // -- Items --
            modelBuilder.Entity<Item>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasDiscriminator<string>("ItemType")
                    .HasValue<Item>("Item")
                    .HasValue<Weapon>("Weapon")
                    .HasValue<Armor>("Armor")
                    .HasValue<Equipment>("Equipment");
                entity.OwnsOne(c => c.Art, art =>
                {
                    art.Property(a => a.FilePath)
                       .HasColumnName("Art_FilePath")
                       .HasMaxLength(500)
                       .IsRequired(false);
                });
            });
            modelBuilder.Entity<Weapon>(entity =>
            {
                entity.OwnsOne(e => e.Damage, damage =>
                {
                    damage.Property(p => p.DiceCount).HasColumnName("Weapon_DiceCount");
                    damage.Property(p => p.DiceSides).HasColumnName("Weapon_DiceSides");
                    damage.Property(p => p.ConstantModifier).HasColumnName("Weapon_ConstantModifier");
                });
            });

            // -- Settlements --
            modelBuilder.Entity<Settlement>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasDiscriminator<string>("SettlementType")
                      .HasValue<City>("City")
                      .HasValue<Castle>("Castle")
                      .HasValue<Village>("Village");
                entity.HasOne<CharacterEntity>()
                      .WithMany()
                      .HasForeignKey(e => e.RulerId)
                      .OnDelete(DeleteBehavior.SetNull);
                entity.HasOne<Province>()
                      .WithMany()
                      .HasForeignKey(e => e.ProvinceId)
                      .OnDelete(DeleteBehavior.SetNull);
                entity.OwnsOne(c => c.Art, art =>
                {
                    art.Property(a => a.FilePath)
                       .HasColumnName("Art_FilePath")
                       .HasMaxLength(500)
                       .IsRequired(false);
                });
            });

            // -- Administrative units --
            modelBuilder.Entity<AdministrativeUnit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasDiscriminator<string>("AdministrativeUnitType")
                    .HasValue<Country>("Country")
                    .HasValue<Province>("Province")
                    .HasValue<Region>("Region");
                entity.HasOne<CharacterEntity>()
                      .WithMany()
                      .HasForeignKey(e => e.RulerId)
                      .OnDelete(DeleteBehavior.SetNull);
                entity.HasOne<AdministrativeUnit>()
                      .WithMany()
                      .HasForeignKey(e => e.ParentId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // -- Users --
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.HasIndex(e => e.Username).IsUnique();
            });
        }
    }
}
