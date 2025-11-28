using Aethera.Application.AdministrativeUnits.Commands.CreateAdministrativeUnit;
using Aethera.Application.AdministrativeUnits.Queries.GetAdministrativeUnits;
using Aethera.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Aethera.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdministrativeUnitsController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateAdministrativeUnitCommand command,
            [FromServices] ICommandHandler<CreateAdministrativeUnitCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(command, ct);
            return Ok(new { message = $"{command.Type} created" });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdministrativeUnitDto>>> GetAll(
            [FromServices] IQueryHandler<GetAdministrativeUnitsQuery, IEnumerable<AdministrativeUnitDto>> handler,
            CancellationToken ct)
        {
            return Ok(await handler.HandleAsync(new GetAdministrativeUnitsQuery(), ct));
        }
    }
}
