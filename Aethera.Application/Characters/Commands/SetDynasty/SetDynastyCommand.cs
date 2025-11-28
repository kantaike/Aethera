using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace Aethera.Application.Characters.Commands.SetDynasty
{
    public record SetDynastyCommand(Guid CharacterId, Guid DynastyId) : ICommand
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

    public class SetDynastyHandler : ICommandHandler<SetDynastyCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IDynastyRepository _dynastyRepository;
        private readonly IUnitOfWork _uow;

        public SetDynastyHandler(ICharacterRepository charRepo, IDynastyRepository dynRepo, IUnitOfWork uow)
        {
            _characterRepository = charRepo;
            _dynastyRepository = dynRepo;
            _uow = uow;
        }

        public async Task HandleAsync(SetDynastyCommand command, CancellationToken ct)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);

            var dynasty = await _dynastyRepository.Get(command.DynastyId, ct);

            character.SetDynasty(command.DynastyId);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
