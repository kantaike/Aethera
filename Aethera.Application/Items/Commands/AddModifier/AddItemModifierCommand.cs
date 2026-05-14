using System;
using System.Threading;
using System.Threading.Tasks;
using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Basic;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Items.Commands.AddModifier
{
    public record AddItemModifierCommand(
        Guid ItemId,
        Guid? SourceId,
        string? Label,
        StatType StatType,
        ModifierType Type,
        ModifierCategory Category,
        double Value,
        int Priority);

    public class AddItemModifierHandler : ICommandHandler<AddItemModifierCommand>
    {
        private readonly IItemRepository _itemRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AddItemModifierHandler(IItemRepository itemRepository, IUnitOfWork unitOfWork)
        {
            _itemRepository = itemRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task HandleAsync(AddItemModifierCommand command, CancellationToken ct)
        {
            var item = await _itemRepository.Get(command.ItemId, ct);
            if (item == null)
                throw new ArgumentException($"Item with ID {command.ItemId} not found");

            var modifier = new Modifier(
                sourceType: ModifierSourceType.Item,
                statType: command.StatType,
                type: command.Type,
                category: command.Category,
                value: command.Value,
                priority: command.Priority,
                sourceId: command.SourceId,
                label: command.Label);

            item.AddModifier(modifier);
            await _unitOfWork.SaveChangesAsync(ct);
        }
    }
}
