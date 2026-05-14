using Aethera.Application.Users.Commands.RegisterUser;
using Aethera.Application.Users.Commands.LoginUser;
using Aethera.Application.Users.Commands.CreateMaster;
using Aethera.Application.Users.Queries.GetCurrentUser;
using Aethera.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;

namespace Aethera.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpGet("me")]
        public async Task<IActionResult> Me(
            [FromServices] IQueryHandler<GetCurrentUserQuery, GetCurrentUserResult?> handler,
            CancellationToken ct)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "User not authenticated" });

            var result = await handler.HandleAsync(new GetCurrentUserQuery(userId), ct);
            if (result == null)
                return NotFound(new { message = "User not found" });

            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] RegisterUserCommand command,
            [FromServices] ICommandHandler<RegisterUserCommand> handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(command, ct);
            return Ok(new { message = "User registered" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginUserCommand command,
            [FromServices] LoginUserHandler handler,
            CancellationToken ct)
        {
            await handler.HandleAsync(command, ct);
            if (handler.Token == null)
                return Unauthorized(new { message = "Invalid credentials" });
            return Ok(new { token = handler.Token });
        }

        [HttpPost("create-master")]
        public async Task<IActionResult> CreateMaster(
            [FromServices] ICommandHandler<CreateMasterCommand> handler,
            [FromServices] IConfiguration configuration,
            CancellationToken ct)
        {
            try
            {
                var masterUsername = configuration["MasterSettings:Username"] ?? "Master";
                var masterPassword = configuration["MasterSettings:Password"] ?? throw new ArgumentException("MasterSettings:Password is not configured");

                await handler.HandleAsync(new CreateMasterCommand(masterUsername, masterPassword), ct);
                return Ok(new { message = "Master user created" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
