using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Basic;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace Aethera.Application.Items.Commands.CreateItemCommand
{
    public record CreateItemCommand(
    string Name,
    string Description,
    int Weight,
    decimal Cost,
    ItemType Type,
    DiceExpression? DamageExpression = null,
    int? ArmorModifier = null, 
    ArmorType? ArmorType = null
    );

    public class CreateItemHandler : ICommandHandler<CreateItemCommand>
    {
        private readonly IItemRepository _repository;
        private readonly IUnitOfWork _uow;

        public CreateItemHandler(IItemRepository repository, IUnitOfWork uow)
        {
            _repository = repository;
            _uow = uow;
        }

        public async Task HandleAsync(CreateItemCommand command, CancellationToken ct)
        {
            Item item = command.Type switch
            {
                ItemType.Weapon => new Weapon(command.Name, command.Description, command.Weight, command.Cost,
                    command.DamageExpression ?? new DiceExpression(1, new D4())),
                ItemType.Armor => new Armor(command.Name, command.Description, command.Weight, command.Cost,
                    command.ArmorModifier, command.ArmorType),
                ItemType.Equipment => new Equipment(command.Name, command.Description, command.Weight, command.Cost),
                _ => new Item(command.Name, command.Description, command.Weight, command.Cost)
            };

            await _repository.Add(item, ct);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
