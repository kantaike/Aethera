using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Factions.Commands.CreateFaction
{
    public record CreateFactionCommand(string Name, string? Description, Guid? DenominationId, Guid? LeaderId);

    public class CreateFactionHandler(IFactionRepository repository, IDenominationRepository denominationRepository, ICharacterRepository characterRepository, IUnitOfWork uow)
        : ICommandHandler<CreateFactionCommand>
    {
        public async Task HandleAsync(CreateFactionCommand command, CancellationToken ct)
        {
            if (command.DenominationId.HasValue)
            {
                await denominationRepository.Get(command.DenominationId.Value, ct);
            }

            if (command.LeaderId.HasValue)
            {
                await characterRepository.Get(command.LeaderId.Value, ct);
            }

            var faction = new Faction(command.Name, command.Description, command.DenominationId, command.LeaderId);

            await repository.Add(faction, ct);
            await uow.SaveChangesAsync(ct);
        }
    }
}
