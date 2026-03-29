using Aethera.Application.Common.Interfaces;
using Aethera.Application.Items.Commands.CreateItemCommand;
using Aethera.Application.Stories.Commands.CreateStory;
using Aethera.Application.Stories.Queries.GetStoriesPreview;
using Aethera.Application.Stories.Queries.GetStoryDetails;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Aethera.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoriesController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateStoryCommand command,
            [FromServices] ICommandHandler<CreateStoryCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(command, ct);
            return Ok();
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StoryDto>>> GetAll(
            [FromServices] IQueryHandler<GetStoriesQuery, IEnumerable<StoryDto>> handler,
            CancellationToken ct)
        {
            return Ok(await handler.HandleAsync(new GetStoriesQuery(), ct));
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(
            Guid id,
            [FromServices] IQueryHandler<GetStoryDetailsQuery, StoryDetailsDto> handler,
            CancellationToken ct)
        {
            return Ok(await handler.HandleAsync(new GetStoryDetailsQuery(id), ct));
        }
    }
}
