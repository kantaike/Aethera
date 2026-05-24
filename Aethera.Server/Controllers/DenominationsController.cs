using Aethera.Application.Common.Authorization;
using Aethera.Application.Common.Interfaces;
using Aethera.Application.Denominations.Commands.AddTranslation;
using Aethera.Application.Denominations.Commands.CreateDenomination;
using Aethera.Application.Denominations.Commands.UpsertRelation;
using Aethera.Application.Denominations.Queries.GetDenominationDetails;
using Aethera.Application.Denominations.Queries.GetDenominationRelations;
using Aethera.Application.Denominations.Queries.GetDenominations;
using Aethera.Domain.Entities.Users;
using Microsoft.AspNetCore.Mvc;

namespace Aethera.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DenominationsController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateDenominationCommand command,
            [FromServices] ICommandHandler<CreateDenominationCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Denomination created" });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DenominationDto>>> GetAll(
            [FromServices] IQueryHandler<GetDenominationsQuery, IEnumerable<DenominationDto>> handler,
            CancellationToken ct)
        {
            return Ok(await handler.HandleAsync(new GetDenominationsQuery(), ct));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DenominationDto>> GetById(
            Guid id,
            [FromServices] IQueryHandler<GetDenominationDetailsQuery, DenominationDto?> handler,
            CancellationToken ct)
        {
            var result = await handler.HandleAsync(new GetDenominationDetailsQuery(id), ct);
            return result is null ? NotFound() : Ok(result);
        }

        [HttpPost("AddTranslation")]
        public async Task<IActionResult> AddTranslation(
            [FromBody] AddDenominationTranslationCommand command,
            [FromServices] ICommandHandler<AddDenominationTranslationCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Translation added" });
        }

        [HttpPut("relations")]
        public async Task<IActionResult> UpsertRelation(
            [FromBody] UpsertDenominationRelationCommand command,
            [FromServices] ICommandHandler<UpsertDenominationRelationCommand> handler,
            [FromServices] IAuthorizationService authorizationService,
            CancellationToken ct)
        {
            authorizationService.RequireRole(Role.Master);
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Relation upserted" });
        }

        [HttpGet("relations")]
        public async Task<ActionResult<IEnumerable<DenominationRelationDto>>> GetAllRelations(
            [FromServices] IQueryHandler<GetAllDenominationRelationsQuery, IEnumerable<DenominationRelationDto>> handler,
            CancellationToken ct)
        {
            return Ok(await handler.HandleAsync(new GetAllDenominationRelationsQuery(), ct));
        }

        [HttpGet("{id}/relations")]
        public async Task<ActionResult<IEnumerable<DenominationRelationDto>>> GetRelations(
            Guid id,
            [FromServices] IQueryHandler<GetDenominationRelationsQuery, IEnumerable<DenominationRelationDto>> handler,
            CancellationToken ct)
        {
            return Ok(await handler.HandleAsync(new GetDenominationRelationsQuery(id), ct));
        }
    }
}
