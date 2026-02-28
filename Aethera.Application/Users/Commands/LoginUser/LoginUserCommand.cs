using Aethera.Domain.Repositories;
using Aethera.Application.Common.Interfaces;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Aethera.Application.Users.Commands.LoginUser
{
    public record LoginUserCommand(string Username, string Password);

    public class LoginUserHandler : ICommandHandler<LoginUserCommand>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _uow;
        private readonly string _jwtSecret = "YourSuperSecretKey1235678!ABCDEFASDDSAFGHJKLIUOMf"; // TODO: move to config
        public string? Token { get; private set; }
        public LoginUserHandler(IUserRepository userRepository, IUnitOfWork uow)
        {
            _userRepository = userRepository;
            _uow = uow;
        }

        public async Task HandleAsync(LoginUserCommand command, CancellationToken ct)
        {
            var users = await _userRepository.Get(ct);
            var user = users.FirstOrDefault(u => u.Username == command.Username);
            if (user == null || user.PasswordHash != HashPassword(command.Password))
            {
                Token = null;
                return;
            }
            Token = GenerateJwtToken(user.Id, user.Username);
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private string GenerateJwtToken(Guid userId, string username)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                    new Claim(ClaimTypes.Name, username)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
