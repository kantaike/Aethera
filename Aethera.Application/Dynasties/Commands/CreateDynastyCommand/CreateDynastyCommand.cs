using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace Aethera.Application.Dynasties.Commands.CreateDynastyCommand
{
    public record CreateDynastyCommand(string Name, string Description) : ICommand
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

    public class CreateDynastyHandler : ICommandHandler<CreateDynastyCommand>
    {
        private readonly IDynastyRepository _repository;
        private readonly IUnitOfWork _uow;

        public CreateDynastyHandler(IDynastyRepository repository, IUnitOfWork uow)
        {
            _repository = repository;
            _uow = uow;
        }

        public async Task HandleAsync(CreateDynastyCommand command, CancellationToken ct)
        {
            var dynasty = new Dynasty(command.Name, command.Description);
            await _repository.Add(dynasty, ct);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
