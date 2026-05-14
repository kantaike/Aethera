using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Characters.Commands.SetBackground
{
    public record SetBackgroundCommand(Guid CharacterId, Background Background);

    public class SetBackgroundHandler : ICommandHandler<SetBackgroundCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IUnitOfWork _uow;

        public SetBackgroundHandler(ICharacterRepository characterRepository, IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _uow = uow;
        }

        public async Task HandleAsync(SetBackgroundCommand command, CancellationToken ct = default)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);
            character.SetBackground(command.Background);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
