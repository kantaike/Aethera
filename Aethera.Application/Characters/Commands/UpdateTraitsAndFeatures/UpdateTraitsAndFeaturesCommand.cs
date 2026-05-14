using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;

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
        private readonly IUnitOfWork _uow;

        public UpdateTraitsAndFeaturesHandler(ICharacterRepository characterRepository, IUnitOfWork uow)
        {
            _characterRepository = characterRepository;
            _uow = uow;
        }

        public async Task HandleAsync(UpdateTraitsAndFeaturesCommand command, CancellationToken ct = default)
        {
            var character = await _characterRepository.Get(command.CharacterId, ct);

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
