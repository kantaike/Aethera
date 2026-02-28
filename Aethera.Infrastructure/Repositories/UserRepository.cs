using Aethera.Domain.Entities.Users;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Persistence;
using Aethera.Domain.Common;

namespace Aethera.Infrastructure.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context, ICultureProvider? cultureProvider = null)
            : base(context, cultureProvider)
        {
        }
    }
}
