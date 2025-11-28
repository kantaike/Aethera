using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Common;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Factories.Interfaces;
using Aethera.Domain.Repositories;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Aethera.Application.Characters.Commands.CreateCharacter
{
    // Minimal-record expanded to support detailed creation via factory.
    // (params) Name, Species, optional Class and optional configuration fields.
    public record CreateCharacterCommand(
        string Name,
        Species Species,
        CharacterClass? Class = null,
        int? Level = null,
        long? ExperiencePoints = null,
        Alignment? Alignment = null,
        Guid? BackgroundId = null,
        string? Backstory = null,
        string? Personality = null,
        IEnumerable<Skill>? SkillProficiencies = null,
        IEnumerable<Language>? LanguageProficiencies = null,
        IDictionary<string, int>? Attributes = null // keys: "strength","dexterity","constitution","intelligence","wisdom","charisma"
    );

    // Application/Characters/Commands/CreateCharacter/CreateCharacterHandler.cs
    public class CreateCharacterHandler : ICommandHandler<CreateCharacterCommand>
    {
        private readonly ICharacterRepository _repository;
        private readonly IUnitOfWork _uow;
        private readonly ICharacterFactory _factory;
        private readonly IValidator<CreateCharacterCommand> _validator;
        public CreateCharacterHandler(ICharacterRepository repository,
            IUnitOfWork unitOfWork, ICharacterFactory factory, IValidator<CreateCharacterCommand> validator)
        {
            _repository = repository;
            _uow = unitOfWork;
            _factory = factory;
            _validator = validator;
        }

        public async Task HandleAsync(CreateCharacterCommand command, CancellationToken ct = default)
        {
            var validationResult = await _validator.ValidateAsync(command, ct);

            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            // Use factory's detailed creation with configure Action to apply additional properties.
            var character = _factory.CreateCharacterDetailed(command.Name, command.Species, command.Class, c =>
            {
                // Level (LevelUp accepts increment count; Character starts at 1)
                if (command.Level.HasValue && command.Level.Value > 1)
                {
                    c.LevelUp(command.Level.Value - 1);
                }

                // Experience
                if (command.ExperiencePoints.HasValue)
                {
                    c.GainExperience(command.ExperiencePoints.Value);
                }

                // Alignment & background
                if (command.Alignment.HasValue)
                {
                    c.SetAlignment(command.Alignment.Value);
                }

                if (command.BackgroundId.HasValue)
                {
                    c.SetBackground(command.BackgroundId.Value);
                }

                // Traits/backstory/personality (personality param to UpdateTraitsAndFeatures is required, supply empty if null)
                if (!string.IsNullOrEmpty(command.Backstory) || !string.IsNullOrEmpty(command.Personality))
                {
                    c.UpdateTraitsAndFeatures(null, null, command.Backstory, command.Personality ?? string.Empty);
                }

                // Skill & language proficiencies
                if (command.SkillProficiencies is not null)
                {
                    foreach (var skill in command.SkillProficiencies)
                    {
                        c.AddSkillProficiency(skill);
                    }
                }

                if (command.LanguageProficiencies is not null)
                {
                    foreach (var lang in command.LanguageProficiencies)
                    {
                        c.AddLanguageProficiency(lang);
                    }
                }

                // Attributes map: update any provided attribute by name (case-insensitive)
                if (command.Attributes is not null)
                {
                    foreach (var kv in command.Attributes)
                    {
                        if (string.IsNullOrWhiteSpace(kv.Key)) continue;
                        try
                        {
                            c.UpdateAttribute(kv.Key, kv.Value);
                        }
                        catch (ArgumentException)
                        {
                            // ignore unknown attribute keys
                        }
                    }
                }
            });

            await _repository.AddWithTranslation(character, ct);

            await _uow.SaveChangesAsync(ct);
        }
    }
}