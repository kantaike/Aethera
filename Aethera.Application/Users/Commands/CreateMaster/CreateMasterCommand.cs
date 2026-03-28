using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Users;
using Aethera.Domain.Repositories;
using System.Security.Cryptography;
using System.Text;

namespace Aethera.Application.Users.Commands.CreateMaster
{
    public record CreateMasterCommand(string Username, string Password);

    public class CreateMasterHandler : ICommandHandler<CreateMasterCommand>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _uow;

        public CreateMasterHandler(IUserRepository userRepository, IUnitOfWork uow)
        {
            _userRepository = userRepository;
            _uow = uow;
        }

        public async Task HandleAsync(CreateMasterCommand command, CancellationToken ct)
        {
            var users = await _userRepository.Get(ct);
            
            // Check if Master user already exists
            if (users.Any(u => u.Role == Role.Master))
                throw new InvalidOperationException("Master user already exists in the system");
            
            // Check if username is already taken
            if (users.Any(u => u.Username == command.Username))
                throw new InvalidOperationException($"Username '{command.Username}' is already taken");

            var passwordHash = HashPassword(command.Password);
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = command.Username,
                PasswordHash = passwordHash,
                Role = Role.Master
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
