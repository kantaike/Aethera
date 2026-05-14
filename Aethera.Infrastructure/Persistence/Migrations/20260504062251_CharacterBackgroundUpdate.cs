using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aethera.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CharacterBackgroundUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BackgroundId",
                table: "Characters");

            migrationBuilder.AddColumn<int>(
                name: "Background",
                table: "Characters",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Background",
                table: "Characters");

            migrationBuilder.AddColumn<Guid>(
                name: "BackgroundId",
                table: "Characters",
                type: "uuid",
                nullable: true);
        }
    }
}
