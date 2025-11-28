using Aethera.Domain.Common;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure.Repositories
{
    public class Repository<Entity> : IRepository<Entity> where Entity : class
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<Entity> _entities;
        protected readonly ICultureProvider _cultureProvider;
        public Repository(ApplicationDbContext context, ICultureProvider cultureProvider = null) 
        {
            _context = context;
            _entities = _context.Set<Entity>();
            _cultureProvider = cultureProvider;
        }
        public async Task Add(Entity entity, CancellationToken ct)
        {
            await _entities.AddAsync(entity, ct);
        }

        public Task<bool> Delete(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<Entity> Get(Guid id, CancellationToken ct)
        {
            var entity = await _entities.FindAsync(id, ct) 
                ?? throw new KeyNotFoundException($"{typeof(Entity)} with id {id} not found.");
            return entity;
        }

        public async Task<IEnumerable<Entity>> Get(CancellationToken ct)
        {
            return await _entities.ToListAsync();
        }

        public Task<Entity> Update(Entity entity)
        {
            throw new NotImplementedException();
        }
    }
}
