using Aethera.Application.Users.Commands.RegisterUser;
using Aethera.Application.Users.Commands.LoginUser;
using Aethera.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Aethera.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
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
    }
}
