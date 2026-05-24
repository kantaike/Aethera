using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Denominations.Commands.CreateDenomination
{
    public record CreateDenominationCommand(
        string Name,
        string? Description,
        string? Tenets,
        string? Appearance,
        Religion Religion,
        Guid? LeaderId);

    public class CreateDenominationHandler(IDenominationRepository repository, ICharacterRepository characterRepository, IUnitOfWork uow)
        : ICommandHandler<CreateDenominationCommand>
    {
        public async Task HandleAsync(CreateDenominationCommand command, CancellationToken ct)
        {
            if (command.LeaderId.HasValue)
            {
                await characterRepository.Get(command.LeaderId.Value, ct);
            }

            var denomination = new Denomination(
                command.Name,
                command.Description,
                command.Tenets,
                command.Appearance,
                command.Religion,
                command.LeaderId);

            await repository.Add(denomination, ct);
            await uow.SaveChangesAsync(ct);
        }
    }
}
