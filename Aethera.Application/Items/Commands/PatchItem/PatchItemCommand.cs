using Aethera.Application.Common.Interfaces;
using Aethera.Application.Common.Authorization;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Entities.Users;
using Aethera.Domain.Repositories;
using Microsoft.AspNetCore.JsonPatch;
using System;

namespace Aethera.Application.Items.Commands.PatchItem
{
    public class ItemPatchDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? Weight { get; set; }
        public decimal? Cost { get; set; }
    }

    public record PatchItemCommand
    {
        public Guid ItemId { get; init; }
        public JsonPatchDocument<ItemPatchDto> PatchDocument { get; init; } = new();
    }

    public class PatchItemHandler : ICommandHandler<PatchItemCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IItemRepository _itemRepository;
        private readonly IAuthorizationService _authorizationService;

        public PatchItemHandler(IUnitOfWork unitOfWork, IItemRepository itemRepository, IAuthorizationService authorizationService)
        {
            _unitOfWork = unitOfWork;
            _itemRepository = itemRepository;
            _authorizationService = authorizationService;
        }

        public async Task HandleAsync(PatchItemCommand command, CancellationToken cancellationToken)
        {
            _authorizationService.RequireRole(Role.Master);

            var item = await _itemRepository.Get(command.ItemId, cancellationToken)
                ?? throw new InvalidOperationException($"Item with id {command.ItemId} not found.");

            var itemPatchDto = new ItemPatchDto
            {
                Name = item.Name,
                Description = item.Description,
                Weight = item.Weight,
                Cost = item.Cost
            };

            command.PatchDocument.ApplyTo(itemPatchDto);

            if (itemPatchDto.Name != null && itemPatchDto.Name != item.Name)
                item.SetName(itemPatchDto.Name);

            if (itemPatchDto.Description != null && itemPatchDto.Description != item.Description)
                item.SetDescription(itemPatchDto.Description);

            if (itemPatchDto.Weight.HasValue && itemPatchDto.Weight != item.Weight)
                item.SetWeight(itemPatchDto.Weight.Value);

            if (itemPatchDto.Cost.HasValue && itemPatchDto.Cost != item.Cost)
                item.SetCost(itemPatchDto.Cost.Value);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
