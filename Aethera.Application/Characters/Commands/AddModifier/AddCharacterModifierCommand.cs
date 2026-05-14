using System;
using System.Threading;
using System.Threading.Tasks;
using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Basic;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Characters.Commands.AddModifier
{
    public record AddCharacterModifierCommand(
        Guid CharacterId,
        Guid? SourceId,
        string? Label,
        StatType StatType,
        ModifierType Type,
        ModifierCategory Category,
        double Value,
        int Priority);

    public class AddCharacterModifierHandler : ICommandHandler<AddCharacterModifierCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AddCharacterModifierHandler(ICharacterRepository characterRepository, IUnitOfWork unitOfWork)
        {
            _characterRepository = characterRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task HandleAsync(AddCharacterModifierCommand command, CancellationToken ct)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);
            if (character == null)
                throw new ArgumentException($"Character with ID {command.CharacterId} not found");

            var modifier = new Modifier(
                sourceType: ModifierSourceType.Character,
                statType: command.StatType,
                type: command.Type,
                category: command.Category,
                value: command.Value,
                priority: command.Priority,
                sourceId: command.SourceId,
                label: command.Label);

            character.AddModifier(modifier);
            await _unitOfWork.SaveChangesAsync(ct);
        }
    }
}
