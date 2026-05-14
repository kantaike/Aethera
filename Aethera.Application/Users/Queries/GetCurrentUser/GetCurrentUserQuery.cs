using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;
using Aethera.Domain.Entities.Users;

namespace Aethera.Application.Users.Queries.GetCurrentUser
{
    public record GetCurrentUserQuery(Guid UserId);

    public record GetCurrentUserResult(Guid Id, string Username, Role Role);

    public class GetCurrentUserHandler : IQueryHandler<GetCurrentUserQuery, GetCurrentUserResult?>
    {
        private readonly IUserRepository _userRepository;

        public GetCurrentUserHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<GetCurrentUserResult?> HandleAsync(GetCurrentUserQuery query, CancellationToken ct = default)
        {
            var users = await _userRepository.Get(ct);
            var user = users.FirstOrDefault(u => u.Id == query.UserId);

            if (user == null)
                return null;

            return new GetCurrentUserResult(user.Id, user.Username, user.Role);
        }
    }
}
