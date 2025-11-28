using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace Aethera.Application.Characters.Commands.AddTranslation
{
    public record AddTranslationCommand(Guid Id, string? Name, string? Feats, string? Backstory, string? Personality) : ICommand
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
    public class AddTranslationHandler : ICommandHandler<AddTranslationCommand>
    {
        ICharacterRepository _characterRepository;
        IUnitOfWork _uow;
        public AddTranslationHandler(ICharacterRepository characterRepository, IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _uow = uow;
        }
        public async Task HandleAsync(AddTranslationCommand command, CancellationToken ct = default)
        {
            await _characterRepository.AddTranslation(command.Id, command.Name, command.Feats, command.Backstory, command.Personality);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
