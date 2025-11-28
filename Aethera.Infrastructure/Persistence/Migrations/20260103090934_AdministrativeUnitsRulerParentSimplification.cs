using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aethera.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdministrativeUnitsRulerParentSimplification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CountryId",
                table: "AdministrativeUnit");

            migrationBuilder.DropColumn(
                name: "Province_RulerId",
                table: "AdministrativeUnit");

            migrationBuilder.DropColumn(
                name: "RegionId",
                table: "AdministrativeUnit");

            migrationBuilder.DropColumn(
                name: "Region_RulerId",
                table: "AdministrativeUnit");

            migrationBuilder.RenameColumn(
                name: "SuzerainId",
                table: "AdministrativeUnit",
                newName: "ParentId");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Characters",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateIndex(
                name: "IX_AdministrativeUnit_ParentId",
                table: "AdministrativeUnit",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_AdministrativeUnit_RulerId",
                table: "AdministrativeUnit",
                column: "RulerId");

            migrationBuilder.AddForeignKey(
                name: "FK_AdministrativeUnit_AdministrativeUnit_ParentId",
                table: "AdministrativeUnit",
                column: "ParentId",
                principalTable: "AdministrativeUnit",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_AdministrativeUnit_Characters_RulerId",
                table: "AdministrativeUnit",
                column: "RulerId",
                principalTable: "Characters",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AdministrativeUnit_AdministrativeUnit_ParentId",
                table: "AdministrativeUnit");

            migrationBuilder.DropForeignKey(
                name: "FK_AdministrativeUnit_Characters_RulerId",
                table: "AdministrativeUnit");

            migrationBuilder.DropIndex(
                name: "IX_AdministrativeUnit_ParentId",
                table: "AdministrativeUnit");

            migrationBuilder.DropIndex(
                name: "IX_AdministrativeUnit_RulerId",
                table: "AdministrativeUnit");

            migrationBuilder.RenameColumn(
                name: "ParentId",
                table: "AdministrativeUnit",
                newName: "SuzerainId");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Characters",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.AddColumn<Guid>(
                name: "CountryId",
                table: "AdministrativeUnit",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Province_RulerId",
                table: "AdministrativeUnit",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RegionId",
                table: "AdministrativeUnit",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Region_RulerId",
                table: "AdministrativeUnit",
                type: "uuid",
                nullable: true);
        }
    }
}
