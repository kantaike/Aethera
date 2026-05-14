using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Characters.Commands.AddSkillProficiency
{
    public record AddSkillProficiencyCommand(Guid CharacterId, Skill Skill);

    public class AddSkillProficiencyHandler : ICommandHandler<AddSkillProficiencyCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IUnitOfWork _uow;

        public AddSkillProficiencyHandler(ICharacterRepository characterRepository, IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _uow = uow;
        }

        public async Task HandleAsync(AddSkillProficiencyCommand command, CancellationToken ct = default)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);
            character.AddSkillProficiency(command.Skill);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
