using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aethera.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdministrativeUnit",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    AdministrativeUnitType = table.Column<string>(type: "character varying(21)", maxLength: 21, nullable: false),
                    SuzerainId = table.Column<Guid>(type: "uuid", nullable: true),
                    RulerId = table.Column<Guid>(type: "uuid", nullable: true),
                    RegionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Province_RulerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CountryId = table.Column<Guid>(type: "uuid", nullable: true),
                    Region_RulerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EntityState = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdministrativeUnit", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Dynasties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EntityState = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dynasties", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Weight = table.Column<int>(type: "integer", nullable: true),
                    Cost = table.Column<decimal>(type: "numeric", nullable: true),
                    ItemType = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    ArmorModifier = table.Column<int>(type: "integer", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: true),
                    Weapon_ConstantModifier = table.Column<int>(type: "integer", nullable: true),
                    Weapon_DiceCount = table.Column<int>(type: "integer", nullable: true),
                    Weapon_DiceSides = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EntityState = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Religions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    LeaderId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EntityState = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Religions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Spells",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Level = table.Column<int>(type: "integer", nullable: true),
                    Healing_ConstantModifier = table.Column<int>(type: "integer", nullable: true),
                    Healing_DiceCount = table.Column<int>(type: "integer", nullable: true),
                    Healing_DiceSides = table.Column<int>(type: "integer", nullable: true),
                    Damage_ConstantModifier = table.Column<int>(type: "integer", nullable: true),
                    Damage_DiceCount = table.Column<int>(type: "integer", nullable: true),
                    Damage_DiceSides = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EntityState = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Spells", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Characters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Species = table.Column<int>(type: "integer", nullable: true),
                    Class = table.Column<int>(type: "integer", nullable: true),
                    SubClass = table.Column<int>(type: "integer", nullable: true),
                    Level = table.Column<int>(type: "integer", nullable: true),
                    ExperiencePoints = table.Column<long>(type: "bigint", nullable: true),
                    Size = table.Column<int>(type: "integer", nullable: true),
                    Alignment = table.Column<int>(type: "integer", nullable: true),
                    DynastyId = table.Column<Guid>(type: "uuid", nullable: true),
                    HometownId = table.Column<Guid>(type: "uuid", nullable: true),
                    FatherId = table.Column<Guid>(type: "uuid", nullable: true),
                    MotherId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProficiencyBonus = table.Column<int>(type: "integer", nullable: true),
                    Initiative = table.Column<int>(type: "integer", nullable: true),
                    ArmorClass = table.Column<int>(type: "integer", nullable: true),
                    Speed = table.Column<int>(type: "integer", nullable: true),
                    PassivePerception = table.Column<int>(type: "integer", nullable: true),
                    HP_Maximum = table.Column<int>(type: "integer", nullable: true),
                    HP_Current = table.Column<int>(type: "integer", nullable: true),
                    HP_Temporary = table.Column<int>(type: "integer", nullable: true),
                    HitDice_DiceSides = table.Column<int>(type: "integer", nullable: true),
                    DeathSaveSuccesses = table.Column<int>(type: "integer", nullable: true),
                    DeathSaveFailures = table.Column<int>(type: "integer", nullable: true),
                    Strength_Score = table.Column<int>(type: "integer", nullable: true),
                    Strength_Modifier = table.Column<int>(type: "integer", nullable: true),
                    Dexterity_Score = table.Column<int>(type: "integer", nullable: true),
                    Dexterity_Modifier = table.Column<int>(type: "integer", nullable: true),
                    Constitution_Score = table.Column<int>(type: "integer", nullable: true),
                    Constitution_Modifier = table.Column<int>(type: "integer", nullable: true),
                    Intelligence_Score = table.Column<int>(type: "integer", nullable: true),
                    Intelligence_Modifier = table.Column<int>(type: "integer", nullable: true),
                    Wisdom_Score = table.Column<int>(type: "integer", nullable: true),
                    Wisdom_Modifier = table.Column<int>(type: "integer", nullable: true),
                    Charisma_Score = table.Column<int>(type: "integer", nullable: true),
                    Charisma_Modifier = table.Column<int>(type: "integer", nullable: true),
                    SavingThrowProficiencies = table.Column<List<string>>(type: "text[]", nullable: false),
                    SkillProficiencies = table.Column<int[]>(type: "integer[]", nullable: false),
                    LanguageProficiencies = table.Column<int[]>(type: "integer[]", nullable: false),
                    EquipmentProficiencies = table.Column<List<string>>(type: "text[]", nullable: false),
                    ClassFeatures = table.Column<string>(type: "text", nullable: true),
                    SpeciesTraits = table.Column<string>(type: "text", nullable: true),
                    Feats = table.Column<string>(type: "text", nullable: true),
                    HeroicInspirationCount = table.Column<int>(type: "integer", nullable: true),
                    BackgroundId = table.Column<Guid>(type: "uuid", nullable: true),
                    BackstoryAndPersonality = table.Column<string>(type: "text", nullable: true),
                    EquipedArmorId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EntityState = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Characters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Characters_Characters_FatherId",
                        column: x => x.FatherId,
                        principalTable: "Characters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Characters_Characters_MotherId",
                        column: x => x.MotherId,
                        principalTable: "Characters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Characters_Dynasties_DynastyId",
                        column: x => x.DynastyId,
                        principalTable: "Dynasties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Settlements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Population = table.Column<int>(type: "integer", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: true),
                    RulerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProvinceId = table.Column<Guid>(type: "uuid", nullable: true),
                    SettlementType = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EntityState = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settlements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Settlements_AdministrativeUnit_ProvinceId",
                        column: x => x.ProvinceId,
                        principalTable: "AdministrativeUnit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Settlements_Characters_RulerId",
                        column: x => x.RulerId,
                        principalTable: "Characters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Characters_DynastyId",
                table: "Characters",
                column: "DynastyId");

            migrationBuilder.CreateIndex(
                name: "IX_Characters_FatherId",
                table: "Characters",
                column: "FatherId");

            migrationBuilder.CreateIndex(
                name: "IX_Characters_HometownId",
                table: "Characters",
                column: "HometownId");

            migrationBuilder.CreateIndex(
                name: "IX_Characters_MotherId",
                table: "Characters",
                column: "MotherId");

            migrationBuilder.CreateIndex(
                name: "IX_Characters_Name",
                table: "Characters",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Settlements_ProvinceId",
                table: "Settlements",
                column: "ProvinceId");

            migrationBuilder.CreateIndex(
                name: "IX_Settlements_RulerId",
                table: "Settlements",
                column: "RulerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Characters_Settlements_HometownId",
                table: "Characters",
                column: "HometownId",
                principalTable: "Settlements",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Characters_Dynasties_DynastyId",
                table: "Characters");

            migrationBuilder.DropForeignKey(
                name: "FK_Characters_Settlements_HometownId",
                table: "Characters");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "Religions");

            migrationBuilder.DropTable(
                name: "Spells");

            migrationBuilder.DropTable(
                name: "Dynasties");

            migrationBuilder.DropTable(
                name: "Settlements");

            migrationBuilder.DropTable(
                name: "AdministrativeUnit");

            migrationBuilder.DropTable(
                name: "Characters");
        }
    }
}
