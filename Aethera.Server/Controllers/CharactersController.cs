using Aethera.Application.Characters.Commands.AddItem;
using Aethera.Application.Characters.Commands.AddLanguageProficiency;
using Aethera.Application.Characters.Commands.AddModifier;
using Aethera.Application.Characters.Commands.AddSkillProficiency;
using Aethera.Application.Characters.Commands.AddTranslation;
using Aethera.Application.Characters.Commands.CreateCharacter;
using Aethera.Application.Characters.Commands.EquipItem;
using Aethera.Application.Characters.Commands.LevelUp;
using Aethera.Application.Characters.Commands.RemoveModifier;
using Aethera.Application.Characters.Commands.SetAlignment;
using Aethera.Application.Characters.Commands.SetBackground;
using Aethera.Application.Characters.Commands.SetDynasty;
using Aethera.Application.Characters.Commands.SetHometown;
using Aethera.Application.Characters.Commands.SetParents;
using Aethera.Application.Characters.Commands.UpdateTraitsAndFeatures;
using Aethera.Application.Characters.Queries.GetCharacterDetails;
using Aethera.Application.Characters.Queries.GetCharacterModifiers;
using Aethera.Application.Characters.Queries.GetCharactersList;
using Aethera.Application.Common.Interfaces;
using Aethera.Application.DTOs;
using Aethera.Domain.Common;
using Aethera.Domain.Entities.Characters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Aethera.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CharactersController : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CharacterPreview>>> Get(
            [FromServices] IQueryHandler<GetCharactersQuery, IEnumerable<CharacterPreview>> handler,
            CancellationToken ct)
        {
            var query = new GetCharactersQuery();
            var result = await handler.HandleAsync(query, ct);

            return Ok(result);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<CharacterDetailDto>>> Get(
            Guid id, [FromServices] IQueryHandler<GetCharacterDetailQuery, CharacterDetailDto> handler,
            CancellationToken ct)
        {
            var query = new GetCharacterDetailQuery(id);
            var result = await handler.HandleAsync(query, ct);

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
        [FromBody] CreateCharacterCommand command,
        [FromServices] ICommandHandler<CreateCharacterCommand> handler,
        CancellationToken ct)
        {
            await handler.HandleAsync(command, ct);

            return Ok(new { message = "Character created" });
        }

        [HttpPut("equip")]
        public async Task<IActionResult> EquipItem(
        [FromBody] EquipItemCommand command,
        [FromServices] ICommandHandler<EquipItemCommand> handler,
        CancellationToken ct)
        {
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Item equiped successfully" });
        }

        [HttpPut("{id}/dynasty")]
        public async Task<IActionResult> SetDynasty(
        Guid id,
        [FromBody] Guid dynastyId,
        [FromServices] ICommandHandler<SetDynastyCommand> handler,
        CancellationToken ct)
        {
            await handler.HandleAsync(new SetDynastyCommand(id, dynastyId), ct);
            return Ok(new { message = "Dynasty updated" });
        }
        //Todo: change body to a proper DTO
        [HttpPut("{id}/parents")]
        public async Task<IActionResult> SetParents(
            Guid id,
            [FromBody] SetParentsCommand request,
            [FromServices] ICommandHandler<SetParentsCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(new SetParentsCommand(id, request.FatherId, request.MotherId), ct);
            return Ok(new { message = "Parents are set" });
        }

        [HttpPost("AddTranslation")]
        public async Task<IActionResult> AddTranslation(
        [FromBody] AddTranslationCommand command,
        [FromServices] ICommandHandler<AddTranslationCommand> handler,
        CancellationToken ct)
        {
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Translation added" });
        }

        [HttpPost("modifiers")]
        public async Task<IActionResult> AddModifier(
            [FromBody] AddCharacterModifierCommand command,
            [FromServices] ICommandHandler<AddCharacterModifierCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Modifier added" });
        }

        [HttpGet("{id}/modifiers")]
        public async Task<ActionResult<CharacterModifiersDto>> GetModifiers(
            Guid id,
            [FromServices] IQueryHandler<GetCharacterModifiersQuery, CharacterModifiersDto> handler,
            CancellationToken ct)
        {
            var result = await handler.HandleAsync(new GetCharacterModifiersQuery(id), ct);
            return Ok(result);
        }

        [HttpPost("{id}/levelup")]
                public async Task<IActionResult> LevelUp(
            Guid id,
                        [FromBody] LevelUpCommand command,
                        [FromServices] ICommandHandler<LevelUpCommand> handler,
                        CancellationToken ct)
        {
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Character leveled up" });
        }

        [HttpPost("{id}/items/{itemId}")]
        public async Task<IActionResult> AddItem(
            Guid id,
            Guid itemId,
            [FromServices] ICommandHandler<AddItemCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(new AddItemCommand(id, itemId), ct);
            return Ok(new { message = "Item added successfully" });
        }

        [HttpPut("{id}/traits-and-features")]
        public async Task<IActionResult> UpdateTraitsAndFeatures(
            Guid id,
            [FromBody] UpdateTraitsAndFeaturesCommand command,
            [FromServices] ICommandHandler<UpdateTraitsAndFeaturesCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(command with { CharacterId = id }, ct);
            return Ok(new { message = "Character traits and features updated" });
        }

        [HttpPost("{id}/skills")]
        public async Task<IActionResult> AddSkillProficiency(
            Guid id,
            [FromBody] Skill skill,
            [FromServices] ICommandHandler<AddSkillProficiencyCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(new AddSkillProficiencyCommand(id, skill), ct);
            return Ok(new { message = "Skill proficiency added" });
        }

        [HttpPost("{id}/languages")]
        public async Task<IActionResult> AddLanguageProficiency(
            Guid id,
            [FromBody] Language language,
            [FromServices] ICommandHandler<AddLanguageProficiencyCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(new AddLanguageProficiencyCommand(id, language), ct);
            return Ok(new { message = "Language proficiency added" });
        }

        [HttpPut("{id}/background")]
        public async Task<IActionResult> SetBackground(
            Guid id,
            [FromBody] Background background,
            [FromServices] ICommandHandler<SetBackgroundCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(new SetBackgroundCommand(id, background), ct);
            return Ok(new { message = "Background updated" });
        }

        [HttpPut("{id}/hometown")]
        public async Task<IActionResult> SetHometown(
            Guid id,
            [FromBody] Guid hometownId,
            [FromServices] ICommandHandler<SetHometownCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(new SetHometownCommand(id, hometownId), ct);
            return Ok(new { message = "Hometown updated" });
        }

        [HttpPut("{id}/alignment")]
        public async Task<IActionResult> SetAlignment(
            Guid id,
            [FromBody] Alignment alignment,
            [FromServices] ICommandHandler<SetAlignmentCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(new SetAlignmentCommand(id, alignment), ct);
            return Ok(new { message = "Alignment updated" });
        }

        [HttpDelete("{id}/modifiers/{modifierId}")]
        public async Task<IActionResult> RemoveModifier(
            Guid id,
            Guid modifierId,
            [FromServices] ICommandHandler<RemoveCharacterModifierCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(new RemoveCharacterModifierCommand(id, modifierId), ct);
            return Ok(new { message = "Modifier removed" });
        }
    }
}
