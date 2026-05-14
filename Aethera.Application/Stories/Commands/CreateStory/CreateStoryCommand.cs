using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Settlements;
using Aethera.Domain.Entities.Stories;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Stories.Commands.CreateStory
{
    public record CreateStoryCommand(
    string Title,
    string? Description,
    string Content,
    Guid AuthorId);

    public class CreateStoryHandler : ICommandHandler<CreateStoryCommand>
    {
        private readonly IUnitOfWork _uow;
        private readonly IStoryRepository _repository;
        public CreateStoryHandler(IUnitOfWork uow, IStoryRepository repository)
        {
            _uow = uow;
            _repository = repository;
        }
        public async Task HandleAsync(CreateStoryCommand command, CancellationToken ct = default)
        {
            _repository.AddByCulture(command.Title, command.Description, command.Content, command.AuthorId);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
