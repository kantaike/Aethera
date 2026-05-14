using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Characters.Commands.SetHometown
{
    public record SetHometownCommand(Guid CharacterId, Guid HometownId);

    public class SetHometownHandler : ICommandHandler<SetHometownCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IUnitOfWork _uow;

        public SetHometownHandler(ICharacterRepository characterRepository, IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _uow = uow;
        }

        public async Task HandleAsync(SetHometownCommand command, CancellationToken ct = default)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);
            character.SetHometown(command.HometownId);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
