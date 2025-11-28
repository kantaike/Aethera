using Aethera.Application.Common.Interfaces;
using Aethera.Application.Dynasties.Commands.CreateDynastyCommand;
using Aethera.Application.Dynasties.Queries.GetDynasties;
using Aethera.Application.Dynasties.Queries.GetDynastyById;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Aethera.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DynastiesController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateDynastyCommand command,
            [FromServices] ICommandHandler<CreateDynastyCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "Dynasty created" });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DynastyDto>>> GetAll(
            [FromServices] IQueryHandler<GetDynastiesQuery, IEnumerable<DynastyDto>> handler,
            CancellationToken ct)
        {
            return Ok(await handler.HandleAsync(new GetDynastiesQuery(), ct));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DynastyDto>> GetById(
            Guid id,
            [FromServices] IQueryHandler<GetDynastyByIdQuery, DynastyDto?> handler,
            CancellationToken ct)
        {
            return Ok(await handler.HandleAsync(new GetDynastyByIdQuery(id), ct));
        }
    }
}
