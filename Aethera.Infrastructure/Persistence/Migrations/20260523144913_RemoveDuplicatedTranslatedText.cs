using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aethera.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDuplicatedTranslatedText : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO ""CharacterTranslations"" (""Id"", ""CharacterId"", ""Culture"", ""Name"", ""Feats"", ""Backstory"", ""Personality"", ""CreatedAt"")
                SELECT gen_random_uuid(), c.""Id"", 0, c.""Name"", c.""Feats"", c.""Backstory"", c.""Personality"", NOW()
                FROM ""Characters"" c
                WHERE c.""Name"" IS NOT NULL
                   OR c.""Feats"" IS NOT NULL
                   OR c.""Backstory"" IS NOT NULL
                   OR c.""Personality"" IS NOT NULL
                ON CONFLICT (""CharacterId"", ""Culture"") DO NOTHING;

                UPDATE ""CharacterTranslations"" ct
                SET ""Name"" = COALESCE(ct.""Name"", c.""Name""),
                    ""Feats"" = COALESCE(ct.""Feats"", c.""Feats""),
                    ""Backstory"" = COALESCE(ct.""Backstory"", c.""Backstory""),
                    ""Personality"" = COALESCE(ct.""Personality"", c.""Personality"")
                FROM ""Characters"" c
                WHERE ct.""CharacterId"" = c.""Id""
                  AND ct.""Culture"" = 0;

                INSERT INTO ""DynastyTranslations"" (""Id"", ""DynastyId"", ""Culture"", ""Name"", ""Description"", ""Motto"", ""CreatedAt"")
                SELECT gen_random_uuid(), d.""Id"", 0, d.""Name"", d.""Description"", d.""Motto"", NOW()
                FROM ""Dynasties"" d
                WHERE d.""Name"" IS NOT NULL
                   OR d.""Description"" IS NOT NULL
                   OR d.""Motto"" IS NOT NULL
                ON CONFLICT (""DynastyId"", ""Culture"") DO NOTHING;

                UPDATE ""DynastyTranslations"" dt
                SET ""Name"" = COALESCE(dt.""Name"", d.""Name""),
                    ""Description"" = COALESCE(dt.""Description"", d.""Description""),
                    ""Motto"" = COALESCE(dt.""Motto"", d.""Motto"")
                FROM ""Dynasties"" d
                WHERE dt.""DynastyId"" = d.""Id""
                  AND dt.""Culture"" = 0;

                INSERT INTO ""ItemTranslations"" (""Id"", ""ItemId"", ""Culture"", ""Name"", ""Description"", ""CreatedAt"")
                SELECT gen_random_uuid(), i.""Id"", 0, i.""Name"", i.""Description"", NOW()
                FROM ""Items"" i
                WHERE i.""Name"" IS NOT NULL
                   OR i.""Description"" IS NOT NULL
                ON CONFLICT (""ItemId"", ""Culture"") DO NOTHING;

                UPDATE ""ItemTranslations"" it
                SET ""Name"" = COALESCE(it.""Name"", i.""Name""),
                    ""Description"" = COALESCE(it.""Description"", i.""Description"")
                FROM ""Items"" i
                WHERE it.""ItemId"" = i.""Id""
                  AND it.""Culture"" = 0;

                INSERT INTO ""SettlementTranslations"" (""Id"", ""SettlementId"", ""Culture"", ""Title"", ""Description"", ""CreatedAt"")
                SELECT gen_random_uuid(), s.""Id"", 0, s.""Title"", s.""Description"", NOW()
                FROM ""Settlements"" s
                WHERE s.""Title"" IS NOT NULL
                   OR s.""Description"" IS NOT NULL
                ON CONFLICT (""SettlementId"", ""Culture"") DO NOTHING;

                UPDATE ""SettlementTranslations"" st
                SET ""Title"" = COALESCE(st.""Title"", s.""Title""),
                    ""Description"" = COALESCE(st.""Description"", s.""Description"")
                FROM ""Settlements"" s
                WHERE st.""SettlementId"" = s.""Id""
                  AND st.""Culture"" = 0;
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_DynastyTranslations_Dynasties_DynastyId",
                table: "DynastyTranslations",
                column: "DynastyId",
                principalTable: "Dynasties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ItemTranslations_Items_ItemId",
                table: "ItemTranslations",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SettlementTranslations_Settlements_SettlementId",
                table: "SettlementTranslations",
                column: "SettlementId",
                principalTable: "Settlements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Settlements");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Settlements");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Dynasties");

            migrationBuilder.DropColumn(
                name: "Motto",
                table: "Dynasties");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Dynasties");

            migrationBuilder.DropColumn(
                name: "Backstory",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "Feats",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "Personality",
                table: "Characters");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DynastyTranslations_Dynasties_DynastyId",
                table: "DynastyTranslations");

            migrationBuilder.DropForeignKey(
                name: "FK_ItemTranslations_Items_ItemId",
                table: "ItemTranslations");

            migrationBuilder.DropForeignKey(
                name: "FK_SettlementTranslations_Settlements_SettlementId",
                table: "SettlementTranslations");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Settlements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Settlements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Dynasties",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Motto",
                table: "Dynasties",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Dynasties",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Backstory",
                table: "Characters",
                type: "text",
                nullable: true);

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
                name: "Personality",
                table: "Characters",
                type: "text",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE ""Characters"" c
                SET ""Name"" = ct.""Name""
                FROM ""CharacterTranslations"" ct
                WHERE ct.""CharacterId"" = c.""Id""
                  AND ct.""Culture"" = 0;

                UPDATE ""Dynasties"" d
                SET ""Name"" = dt.""Name"",
                    ""Description"" = dt.""Description"",
                    ""Motto"" = dt.""Motto""
                FROM ""DynastyTranslations"" dt
                WHERE dt.""DynastyId"" = d.""Id""
                  AND dt.""Culture"" = 0;

                UPDATE ""Items"" i
                SET ""Name"" = it.""Name"",
                    ""Description"" = it.""Description""
                FROM ""ItemTranslations"" it
                WHERE it.""ItemId"" = i.""Id""
                  AND it.""Culture"" = 0;

                UPDATE ""Settlements"" s
                SET ""Title"" = st.""Title"",
                    ""Description"" = st.""Description""
                FROM ""SettlementTranslations"" st
                WHERE st.""SettlementId"" = s.""Id""
                  AND st.""Culture"" = 0;
            ");
        }
    }
}
