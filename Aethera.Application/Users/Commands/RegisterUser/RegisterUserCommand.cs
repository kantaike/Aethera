using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Users;
using Aethera.Domain.Repositories;
using System.Security.Cryptography;
using System.Text;

namespace Aethera.Application.Users.Commands.RegisterUser
{
    public record RegisterUserCommand(string Username, string Password);

    public class RegisterUserHandler : ICommandHandler<RegisterUserCommand>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _uow;
        public RegisterUserHandler(IUserRepository userRepository, IUnitOfWork uow)
        {
            _userRepository = userRepository;
            _uow = uow;
        }

        public async Task HandleAsync(RegisterUserCommand command, CancellationToken ct)
        {
            var passwordHash = HashPassword(command.Password);
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = command.Username,
                PasswordHash = passwordHash
            };
            await _userRepository.Add(user, ct);
            await _uow.SaveChangesAsync(ct);
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}
