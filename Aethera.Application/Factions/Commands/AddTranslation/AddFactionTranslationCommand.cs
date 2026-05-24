using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Factions.Commands.AddTranslation
{
    public record AddFactionTranslationCommand(Guid Id, string? Name, string? Description);

    public class AddFactionTranslationHandler(IFactionRepository repository, IUnitOfWork uow)
        : ICommandHandler<AddFactionTranslationCommand>
    {
        public async Task HandleAsync(AddFactionTranslationCommand command, CancellationToken ct = default)
        {
            await repository.AddTranslation(command.Id, command.Name, command.Description);
            await uow.SaveChangesAsync(ct);
        }
    }
}
