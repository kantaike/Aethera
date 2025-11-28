using Aethera.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Repositories
{
    public interface IRepository<Entity> where Entity : class
    {
        public Task<Entity> Get(Guid id, CancellationToken ct);
        public Task<IEnumerable<Entity>> Get(CancellationToken ct);
        public Task Add(Entity entity, CancellationToken ct);
        public Task<Entity> Update(Entity entity);
        public Task<bool> Delete(Guid id);
    }
}
