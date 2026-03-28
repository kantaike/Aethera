using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;
using System;

namespace Aethera.Application.Items.Commands.AddTranslation
{
    public record AddItemTranslationCommand(Guid Id, string? Name, string? Description);

    public class AddItemTranslationHandler : ICommandHandler<AddItemTranslationCommand>
    {
        private readonly IItemRepository _itemRepository;
        private readonly IUnitOfWork _uow;

        public AddItemTranslationHandler(IItemRepository itemRepository, IUnitOfWork uow)
        {
            _itemRepository = itemRepository;
            _uow = uow;
        }

        public async Task HandleAsync(AddItemTranslationCommand command, CancellationToken ct = default)
        {
            await _itemRepository.AddTranslation(command.Id, command.Name, command.Description);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
