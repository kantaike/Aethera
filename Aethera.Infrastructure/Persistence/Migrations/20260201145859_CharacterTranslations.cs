using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aethera.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CharacterTranslations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Characters_Name",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "BackstoryAndPersonality",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "ClassFeatures",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "EquipmentProficiencies",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "Feats",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "SpeciesTraits",
                table: "Characters");

            migrationBuilder.CreateTable(
                name: "CharacterTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CharacterId = table.Column<Guid>(type: "uuid", nullable: false),
                    Culture = table.Column<int>(type: "integer", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Feats = table.Column<string>(type: "text", nullable: true),
                    Backstory = table.Column<string>(type: "text", nullable: true),
                    Personality = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EntityState = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CharacterTranslations_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterTranslations_CharacterId_Culture",
                table: "CharacterTranslations",
                columns: new[] { "CharacterId", "Culture" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterTranslations");

            migrationBuilder.AddColumn<string>(
                name: "BackstoryAndPersonality",
                table: "Characters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClassFeatures",
                table: "Characters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "EquipmentProficiencies",
                table: "Characters",
                type: "text[]",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "Feats",
                table: "Characters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Characters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SpeciesTraits",
                table: "Characters",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Characters_Name",
                table: "Characters",
                column: "Name");
        }
    }
}
