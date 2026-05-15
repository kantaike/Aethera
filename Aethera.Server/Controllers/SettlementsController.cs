using Aethera.Application.Common.Authorization;
using Aethera.Application.Common.Interfaces;
using Aethera.Application.Items.Queries.GetItemDetails;
using Aethera.Application.Settlements.Commands.AddTranslation;
using Aethera.Application.Settlements.Commands.CreateSettlement;
using Aethera.Application.Settlements.Commands.PatchSettlement;
using Aethera.Application.Settlements.Queries.GetSettlementDetails;
using Aethera.Application.Settlements.Queries.GetSettlements;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Entities.Settlements;
using Aethera.Domain.Entities.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
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
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
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

        [HttpGet("{id}")]
        public async Task<ActionResult<Settlement>> GetById(
            Guid id,
            [FromServices] IQueryHandler<GetSettlementByIdQuery, Settlement?> handler,
            CancellationToken ct)
        {
            var settlement = await handler.HandleAsync(new GetSettlementByIdQuery(id), ct);
            return settlement != null ? Ok(settlement) : NotFound();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchSettlement(
            Guid id,
            [FromBody] JsonPatchDocument<SettlementPatchDto> patchDocument,
            [FromServices] ICommandHandler<PatchSettlementCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            var command = new PatchSettlementCommand { SettlementId = id, PatchDocument = patchDocument };
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Settlement updated successfully" });
        }

        [HttpPost("AddTranslation")]
        public async Task<IActionResult> AddTranslation(
            [FromBody] AddSettlementTranslationCommand command,
            [FromServices] ICommandHandler<AddSettlementTranslationCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Translation added" });
        }
    }
}
