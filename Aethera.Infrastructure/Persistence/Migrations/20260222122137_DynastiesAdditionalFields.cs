using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aethera.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class DynastiesAdditionalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EstablishedYear",
                table: "Dynasties",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Motto",
                table: "Dynasties",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Characters",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstablishedYear",
                table: "Dynasties");

            migrationBuilder.DropColumn(
                name: "Motto",
                table: "Dynasties");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Characters");
        }
    }
}
