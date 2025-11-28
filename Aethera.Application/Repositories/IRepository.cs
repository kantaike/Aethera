using Aethera.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Repositories
{
    public interface IRepository<TEntity> where TEntity : Entity
    {
        Task<TEntity?> Get(Guid id);

        Task<IReadOnlyList<TEntity>> Get();

        Task AddAsync(TEntity entity);

        Task UpdateAsync(TEntity entity);

        Task DeleteAsync(TEntity entity);
    }
}
