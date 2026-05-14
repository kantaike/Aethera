using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Characters.Commands.SetAlignment
{
    public record SetAlignmentCommand(Guid CharacterId, Alignment Alignment);

    public class SetAlignmentHandler : ICommandHandler<SetAlignmentCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IUnitOfWork _uow;

        public SetAlignmentHandler(ICharacterRepository characterRepository, IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _uow = uow;
        }

        public async Task HandleAsync(SetAlignmentCommand command, CancellationToken ct = default)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);
            character.SetAlignment(command.Alignment);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
