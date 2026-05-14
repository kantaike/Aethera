using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Characters.Commands.RemoveModifier
{
    public record RemoveCharacterModifierCommand(Guid CharacterId, Guid ModifierId);

    public class RemoveCharacterModifierHandler : ICommandHandler<RemoveCharacterModifierCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IUnitOfWork _uow;

        public RemoveCharacterModifierHandler(ICharacterRepository characterRepository, IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _uow = uow;
        }

        public async Task HandleAsync(RemoveCharacterModifierCommand command, CancellationToken ct = default)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);
            character.RemoveModifier(command.ModifierId);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
