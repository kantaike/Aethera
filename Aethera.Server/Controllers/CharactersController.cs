using Aethera.Application.Characters.Commands.AddTranslation;
using Aethera.Application.Characters.Commands.CreateCharacter;
using Aethera.Application.Characters.Commands.EquipItem;
using Aethera.Application.Characters.Commands.SetDynasty;
using Aethera.Application.Characters.Commands.SetParents;
using Aethera.Application.Characters.Queries.GetCharacterDetails;
using Aethera.Application.Characters.Queries.GetCharactersList;
using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Common;
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
    }
}
