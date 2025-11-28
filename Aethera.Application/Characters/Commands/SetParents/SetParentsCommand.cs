using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace Aethera.Application.Characters.Commands.SetParents
{
    public record SetParentsCommand(Guid CharacterId, Guid? FatherId, Guid? MotherId) : ICommand
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

    public class SetParentsHandler : ICommandHandler<SetParentsCommand>
    {
        private readonly ICharacterRepository _repository;
        private readonly IUnitOfWork _uow;

        public SetParentsHandler(ICharacterRepository repository, IUnitOfWork uow)
        {
            _repository = repository;
            _uow = uow;
        }

        public async Task HandleAsync(SetParentsCommand command, CancellationToken ct)
        {
            var character = await _repository.Get(command.CharacterId, ct);

            if (command.FatherId.HasValue)
                _ = await _repository.Get(command.FatherId.Value, ct);

            if (command.MotherId.HasValue)
                _ = await _repository.Get(command.MotherId.Value, ct);

            character.SetParents(command.FatherId, command.MotherId);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
