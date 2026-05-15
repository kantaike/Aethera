using Aethera.Application.Common.Interfaces;
using Aethera.Application.Common.Authorization;
using Aethera.Domain.Repositories;
using Aethera.Domain.Entities.Users;
using System;

namespace Aethera.Application.Characters.Commands.UpdateTraitsAndFeatures
{
    public record UpdateTraitsAndFeaturesCommand
    {
        public Guid CharacterId { get; init; }
        public string? Feats { get; init; }
        public int? HeroicInspirationCount { get; init; }
        public string? Backstory { get; init; }
        public string Personality { get; init; } = string.Empty;
    }

    public class UpdateTraitsAndFeaturesHandler : ICommandHandler<UpdateTraitsAndFeaturesCommand>
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly IAuthorizationService _authorizationService;
        private readonly IUnitOfWork _uow;

        public UpdateTraitsAndFeaturesHandler(ICharacterRepository characterRepository, IUnitOfWork uow,
            IAuthorizationService authorizationService)
        {
            _characterRepository = characterRepository;
            _uow = uow;
            _authorizationService = authorizationService;
        }

        public async Task HandleAsync(UpdateTraitsAndFeaturesCommand command, CancellationToken ct = default)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);
            var userId = _authorizationService.GetCurrentUserId();
            var userRole = _authorizationService.GetUserRole();

            // Players can only update their own character
            if (userRole == Role.Player && character.UserId != userId)
            {
                throw new UnauthorizedAccessException("Players can only update their own character.");
            }

            character.UpdateTraitsAndFeatures(
                command.Feats,
                command.HeroicInspirationCount,
                command.Backstory,
                command.Personality);

            await _characterRepository.UpsertTraitsAndFeaturesTranslation(
                command.CharacterId,
                command.Feats,
                command.Backstory,
                command.Personality,
                ct);

            await _uow.SaveChangesAsync(ct);
        }
    }
}
