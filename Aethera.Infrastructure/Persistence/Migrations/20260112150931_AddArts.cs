using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aethera.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddArts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Art_FilePath",
                table: "Settlements",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Art_FilePath",
                table: "Items",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Art_FilePath",
                table: "Dynasties",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Art_FilePath",
                table: "Characters",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Art_FilePath",
                table: "Settlements");

            migrationBuilder.DropColumn(
                name: "Art_FilePath",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Art_FilePath",
                table: "Dynasties");

            migrationBuilder.DropColumn(
                name: "Art_FilePath",
                table: "Characters");
        }
    }
}
