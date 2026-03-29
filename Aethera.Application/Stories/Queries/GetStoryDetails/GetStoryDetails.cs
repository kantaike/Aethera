using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Common;
using Aethera.Domain.Repositories;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Stories.Queries.GetStoryDetails
{
    public record GetStoryDetailsQuery(Guid Id);
    public record StoryDetailsDto(Guid Id, string Title, string? Description, string Content, Guid? AuthorId, Culture Culture, Art? Art, DateTime? CreatedAt);
    public class GetStoryDetailsHandler : IQueryHandler<GetStoryDetailsQuery, StoryDetailsDto>
    {
        private readonly IStoryRepository _storyRepository;
        public GetStoryDetailsHandler(IStoryRepository storyRepository) => _storyRepository = storyRepository;

        public async Task<StoryDetailsDto> HandleAsync(GetStoryDetailsQuery query, CancellationToken ct = default)
        {
            var result = await _storyRepository.Get(query.Id, ct);
            return new StoryDetailsDto(result.Id, result.Title, result.Description, result.Content, result.AuthorId, result.Culture, result.Art, result.CreatedAt);
        }
    }
}
