using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace Aethera.Application.Characters.Commands.EquipItem
{
    public record EquipItemCommand(Guid CharacterId, Guid ItemId) : ICommand
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

    public class EquipItemHandler : ICommandHandler<EquipItemCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IItemRepository _itemRepository;
        private readonly IUnitOfWork _uow;

        public EquipItemHandler(ICharacterRepository characterRepository, IItemRepository itemRepository, IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _itemRepository = itemRepository;
            _uow = uow;
        }

        public async Task HandleAsync(EquipItemCommand command, CancellationToken ct)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);

            var item = await _itemRepository.Get(command.ItemId, ct);

            character.EquipItem(item);

            await _uow.SaveChangesAsync(ct);
        }
    }
}
