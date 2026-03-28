using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;
using System;

namespace Aethera.Application.Dynasties.Commands.AddTranslation
{
    public record AddDynastyTranslationCommand(Guid Id, string? Name, string? Description, string? Motto);

    public class AddDynastyTranslationHandler : ICommandHandler<AddDynastyTranslationCommand>
    {
        private readonly IDynastyRepository _dynastyRepository;
        private readonly IUnitOfWork _uow;

        public AddDynastyTranslationHandler(IDynastyRepository dynastyRepository, IUnitOfWork uow)
        {
            _dynastyRepository = dynastyRepository;
            _uow = uow;
        }

        public async Task HandleAsync(AddDynastyTranslationCommand command, CancellationToken ct = default)
        {
            await _dynastyRepository.AddTranslation(command.Id, command.Name, command.Description, command.Motto);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
