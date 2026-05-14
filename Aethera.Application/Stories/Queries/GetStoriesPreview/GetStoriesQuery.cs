using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Stories.Queries.GetStoriesPreview
{
    public record GetStoriesQuery();
    public record StoryDto(Guid Id, string Title, string Description, Art? Art);
    public class GetStoriesHandler : IQueryHandler<GetStoriesQuery, IEnumerable<StoryDto>>
    {
        private readonly IStoryRepository _storyRepository;
        public GetStoriesHandler(IStoryRepository storyRepository) => _storyRepository = storyRepository;

        public async Task<IEnumerable<StoryDto>> HandleAsync(GetStoriesQuery query, CancellationToken ct = default)
        {
            var result = await _storyRepository.GetByCulture(ct);
            var stories = result.Select(s => new StoryDto(s.Id, s.Title, s.Description, s.Art));
            return stories;
        }
    }
}
