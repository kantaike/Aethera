using Aethera.Application.Common.Interfaces;
using Aethera.Application.Settlements.Commands.CreateSettlement;
using Aethera.Application.Settlements.Queries.GetSettlements;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Aethera.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettlementsController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateSettlementCommand command,
            [FromServices] ICommandHandler<CreateSettlementCommand> handler,
            CancellationToken ct)
        {
            if (command == null) return BadRequest();
            await handler.HandleAsync(command, ct);
            return Ok(new { message = $"Settlement {command.Title} created successfully" });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SettlementDto>>> GetAll(
            [FromServices] IQueryHandler<GetSettlementsQuery, IEnumerable<SettlementDto>> handler,
            CancellationToken ct)
        {
            var result = await handler.HandleAsync(new GetSettlementsQuery(), ct);
            return Ok(result);
        }
    }
}
