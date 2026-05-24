using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Denominations.Commands.AddTranslation
{
    public record AddDenominationTranslationCommand(Guid Id, string? Name, string? Description, string? Tenets, string? Appearance);

    public class AddDenominationTranslationHandler(IDenominationRepository repository, IUnitOfWork uow)
        : ICommandHandler<AddDenominationTranslationCommand>
    {
        public async Task HandleAsync(AddDenominationTranslationCommand command, CancellationToken ct = default)
        {
            await repository.AddTranslation(command.Id, command.Name, command.Description, command.Tenets, command.Appearance);
            await uow.SaveChangesAsync(ct);
        }
    }
}
