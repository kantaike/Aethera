using Aethera.Domain.Entities.Stories;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Repositories
{
    public interface IStoryRepository : IRepository<Story>
    {
        void AddByCulture(string title, string? description, string content, Guid authorId);
        Task<IEnumerable<(Guid Id, string Title, string Description, Art? Art)>> GetByCulture(CancellationToken ct);
    }
}
