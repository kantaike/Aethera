using Aethera.Domain.Common;
using Aethera.Domain.Entities.Stories;
using Aethera.Domain.Repositories;
using Aethera.Domain.ValueObjects;
using Aethera.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure.Repositories
{
    public class StoryRepository(ApplicationDbContext context, ICultureProvider cultureProvider = null) : Repository<Story>(context, cultureProvider), IStoryRepository
    {
        public void AddByCulture(string title, string? description, string content, Guid authorId)
        {
            var culture = _cultureProvider.Culture;
            var story = new Story(title, description, content, authorId, culture);
            _entities.Add(story);
        }

        public async Task<IEnumerable<(Guid Id, string Title, string Description, Art? Art)>> GetByCulture(CancellationToken ct)
        {
            var culture = _cultureProvider.Culture;
            var results = await _entities
                .Where(s => s.Culture == culture)
                .Select(s => new { s.Id, s.Title, s.Description, s.Art })
                .AsNoTracking()
                .ToListAsync(ct);

            return results.Select(s => (s.Id, s.Title, s.Description ?? string.Empty, s.Art));

        }
    }
}
