using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Common;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Entities.Items;
using Aethera.Domain.Entities.Settlements;
using Aethera.Domain.Repositories;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace Aethera.Application.Common.Commands
{
    // Application/Common/Commands/UploadArt/UploadArtCommand.cs
    public record UploadArtCommand(
        Guid EntityId,
        EntityArtType EntityType,
        Stream FileStream,
        string FileName) : ICommand
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

    public class UploadArtHandler : ICommandHandler<UploadArtCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IItemRepository _itemRepository;
        private readonly ISettlementRepository _settlementRepository;
        private readonly IDynastyRepository _dynastyRepository;
        private readonly IFileService _fileService;
        private readonly IUnitOfWork _uow;

        public UploadArtHandler(
            ICharacterRepository characterRepository,
            IItemRepository itemRepository,
            ISettlementRepository settlementRepository,
            IDynastyRepository dynastyRepository,
            IFileService fileService,
            IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _itemRepository = itemRepository;
            _settlementRepository = settlementRepository;
            _dynastyRepository = dynastyRepository;
            _fileService = fileService;
            _uow = uow;
        }

        public async Task HandleAsync(UploadArtCommand command, CancellationToken ct)
        {
            // 1. Simple switch to get the entity
            IHasArt? entity = command.EntityType switch
            {
                EntityArtType.Character => await _characterRepository.Get(command.EntityId, ct),
                EntityArtType.Item => await _itemRepository.Get(command.EntityId, ct),
                EntityArtType.Settlement => await _settlementRepository.Get(command.EntityId, ct),
                EntityArtType.Dynasty => await _dynastyRepository.Get(command.EntityId, ct),
                _ => throw new ArgumentOutOfRangeException(nameof(command.EntityType), "Unsupported type")
            };

            if (entity == null)
                throw new Exception($"{command.EntityType} not found with ID {command.EntityId}");

            var folder = $"uploads/{command.EntityType.ToString().ToLower()}s";
            var art = Art.Create(command.FileName, folder);

            await _fileService.SaveFileAsync(command.FileStream, art.FilePath);

            entity.SetArt(art);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
