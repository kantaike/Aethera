using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Characters.Commands.AddLanguageProficiency
{
    public record AddLanguageProficiencyCommand(Guid CharacterId, Language Language);

    public class AddLanguageProficiencyHandler : ICommandHandler<AddLanguageProficiencyCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IUnitOfWork _uow;

        public AddLanguageProficiencyHandler(ICharacterRepository characterRepository, IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _uow = uow;
        }

        public async Task HandleAsync(AddLanguageProficiencyCommand command, CancellationToken ct = default)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);
            character.AddLanguageProficiency(command.Language);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
