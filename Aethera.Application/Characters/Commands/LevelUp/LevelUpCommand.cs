using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Repositories;
using Aethera.Domain.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace Aethera.Application.Characters.Commands.LevelUp
{
    public record LevelUpCommand(Guid CharacterId, int Levels) : ICommand
    {
        public event EventHandler? CanExecuteChanged;

        public bool CanExecute(object? parameter)
        {
            throw new NotImplementedException();
        }

        public void Execute(object? parameter)
        {
            throw new NotImplementedException();
        }
    }

    public class LevelUpHandler : ICommandHandler<LevelUpCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IUnitOfWork _uow;

        public LevelUpHandler(ICharacterRepository characterRepository, IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _uow = uow;
        }

        public async Task HandleAsync(LevelUpCommand command, CancellationToken ct)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);

            LevelUpService.LevelUpCharacter(character, command.Levels);

            await _uow.SaveChangesAsync(ct);
        }
    }
}
