using Aethera.Application.Common.Authorization;
using Aethera.Application.Common.Interfaces;
using Aethera.Application.Factions.Commands.AddTranslation;
using Aethera.Application.Factions.Commands.CreateFaction;
using Aethera.Application.Factions.Commands.UpsertRelation;
using Aethera.Application.Factions.Queries.GetFactionDetails;
using Aethera.Application.Factions.Queries.GetFactionRelations;
using Aethera.Application.Factions.Queries.GetFactions;
using Aethera.Domain.Entities.Users;
using Microsoft.AspNetCore.Mvc;

namespace Aethera.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FactionsController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateFactionCommand command,
            [FromServices] ICommandHandler<CreateFactionCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Faction created" });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FactionDto>>> GetAll(
            [FromServices] IQueryHandler<GetFactionsQuery, IEnumerable<FactionDto>> handler,
            CancellationToken ct)
        {
            return Ok(await handler.HandleAsync(new GetFactionsQuery(), ct));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FactionDto>> GetById(
            Guid id,
            [FromServices] IQueryHandler<GetFactionDetailsQuery, FactionDto?> handler,
            CancellationToken ct)
        {
            var result = await handler.HandleAsync(new GetFactionDetailsQuery(id), ct);
            return result is null ? NotFound() : Ok(result);
        }

        [HttpPost("AddTranslation")]
        public async Task<IActionResult> AddTranslation(
            [FromBody] AddFactionTranslationCommand command,
            [FromServices] ICommandHandler<AddFactionTranslationCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Translation added" });
        }

        [HttpPut("relations")]
        public async Task<IActionResult> UpsertRelation(
            [FromBody] UpsertFactionRelationCommand command,
            [FromServices] ICommandHandler<UpsertFactionRelationCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Relation upserted" });
        }

        [HttpGet("{id}/relations")]
        public async Task<ActionResult<IEnumerable<FactionRelationDto>>> GetRelations(
            Guid id,
            [FromServices] IQueryHandler<GetFactionRelationsQuery, IEnumerable<FactionRelationDto>> handler,
            CancellationToken ct)
        {
            return Ok(await handler.HandleAsync(new GetFactionRelationsQuery(id), ct));
        }
    }
}
