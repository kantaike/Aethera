using Aethera.Application.Common.Commands;
using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Aethera.Server.Controllers
{
    // WebApi/Controllers/ArtController.cs
    [ApiController]
    [Route("api/[controller]")]
    public class ArtController : ControllerBase
    {
        [HttpPost("{entityType}/{id}")]
        public async Task<IActionResult> Upload(
            EntityArtType entityType,
            Guid id,
            IFormFile file,
            [FromServices] ICommandHandler<UploadArtCommand> handler,
            CancellationToken ct)
        {
            if (file == null || file.Length == 0) return BadRequest("File isn't chosen");

            using var stream = file.OpenReadStream();
            var command = new UploadArtCommand(id, entityType, stream, file.FileName);

            await handler.HandleAsync(command, ct);

            return Ok(new { message = "Uploaded succesfully" });
        }
    }
}
