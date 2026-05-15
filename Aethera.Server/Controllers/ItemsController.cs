using Aethera.Application.Common.Authorization;
using Aethera.Application.Common.Interfaces;
using Aethera.Application.DTOs;
using Aethera.Application.Items.Commands.AddModifier;
using Aethera.Application.Items.Commands.AddTranslation;
using Aethera.Application.Items.Commands.CreateItemCommand;
using Aethera.Application.Items.Commands.PatchItem;
using Aethera.Application.Items.Queries.GetItemDetails;
using Aethera.Application.Items.Queries.GetItemModifiers;
using Aethera.Application.Items.Queries.GetItemsList;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Entities.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;

namespace Aethera.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateItemCommand command,
            [FromServices] ICommandHandler<CreateItemCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            await handler.HandleAsync(command, ct);
            return Ok();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetAll(
            [FromServices] IQueryHandler<GetItemsQuery, IEnumerable<ItemDto>> handler,
            CancellationToken ct)
        {
            return Ok(await handler.HandleAsync(new GetItemsQuery(), ct));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Item>> GetById(
            Guid id,
            [FromServices] IQueryHandler<GetItemByIdQuery, Item?> handler,
            CancellationToken ct)
        {
            var item = await handler.HandleAsync(new GetItemByIdQuery(id), ct);
            return item != null ? Ok(item) : NotFound();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchItem(
            Guid id,
            [FromBody] JsonPatchDocument<ItemPatchDto> patchDocument,
            [FromServices] ICommandHandler<PatchItemCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            var command = new PatchItemCommand { ItemId = id, PatchDocument = patchDocument };
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Item updated successfully" });
        }

        [HttpPost("AddTranslation")]
        public async Task<IActionResult> AddTranslation(
            [FromBody] AddItemTranslationCommand command,
            [FromServices] ICommandHandler<AddItemTranslationCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Translation added" });
        }

        [HttpPost("modifiers")]
        public async Task<IActionResult> AddModifier(
            [FromBody] AddItemModifierCommand command,
            [FromServices] ICommandHandler<AddItemModifierCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Modifier added" });
        }

        [HttpGet("{id}/modifiers")]
        public async Task<ActionResult<List<ModifierDto>>> GetModifiers(
            Guid id,
            [FromServices] IQueryHandler<GetItemModifiersQuery, List<ModifierDto>> handler,
            CancellationToken ct)
        {
            var result = await handler.HandleAsync(new GetItemModifiersQuery(id), ct);
            return Ok(result);
        }
    }
}
