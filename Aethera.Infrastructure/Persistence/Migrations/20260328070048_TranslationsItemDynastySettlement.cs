using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aethera.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class TranslationsItemDynastySettlement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DynastyTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DynastyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Culture = table.Column<int>(type: "integer", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Motto = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EntityState = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DynastyTranslations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ItemTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    Culture = table.Column<int>(type: "integer", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EntityState = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemTranslations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SettlementTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SettlementId = table.Column<Guid>(type: "uuid", nullable: false),
                    Culture = table.Column<int>(type: "integer", maxLength: 10, nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EntityState = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SettlementTranslations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DynastyTranslations_DynastyId_Culture",
                table: "DynastyTranslations",
                columns: new[] { "DynastyId", "Culture" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemTranslations_ItemId_Culture",
                table: "ItemTranslations",
                columns: new[] { "ItemId", "Culture" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SettlementTranslations_SettlementId_Culture",
                table: "SettlementTranslations",
                columns: new[] { "SettlementId", "Culture" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DynastyTranslations");

            migrationBuilder.DropTable(
                name: "ItemTranslations");

            migrationBuilder.DropTable(
                name: "SettlementTranslations");
        }
    }
}
