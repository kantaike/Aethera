using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Characters.Commands.AddItem
{
    public record AddItemCommand(Guid CharacterId, Guid ItemId);

    public class AddItemHandler : ICommandHandler<AddItemCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IItemRepository _itemRepository;
        private readonly IUnitOfWork _uow;

        public AddItemHandler(ICharacterRepository characterRepository, IItemRepository itemRepository, IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _itemRepository = itemRepository;
            _uow = uow;
        }

        public async Task HandleAsync(AddItemCommand command, CancellationToken ct = default)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);
            var item = await _itemRepository.Get(command.ItemId, ct);

            character.AddItem(item);

            await _uow.SaveChangesAsync(ct);
        }
    }
}
