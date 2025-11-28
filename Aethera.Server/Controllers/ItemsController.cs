using Aethera.Application.Common.Interfaces;
using Aethera.Application.Items.Commands.CreateItemCommand;
using Aethera.Application.Items.Queries.GetItemDetails;
using Aethera.Application.Items.Queries.GetItemsList;
using Aethera.Domain.Entities.Items;
using Microsoft.AspNetCore.Http;
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
            CancellationToken ct)
        {
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
    }
}
