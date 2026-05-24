using Aethera.Application.Common.Interfaces;
using Aethera.Application.Common.Authorization;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Entities.Users;
using Aethera.Domain.Repositories;
using Microsoft.AspNetCore.JsonPatch;
using System;

namespace Aethera.Application.Dynasties.Commands.PatchDynasty
{
    public class DynastyPatchDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Motto { get; set; }
        public int? EstablishedYear { get; set; }
    }

    public record PatchDynastyCommand
    {
        public Guid DynastyId { get; init; }
        public JsonPatchDocument<DynastyPatchDto> PatchDocument { get; init; } = new();
    }

    public class PatchDynastyHandler : ICommandHandler<PatchDynastyCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDynastyRepository _dynastyRepository;
        private readonly IAuthorizationService _authorizationService;

        public PatchDynastyHandler(IUnitOfWork unitOfWork, IDynastyRepository dynastyRepository, IAuthorizationService authorizationService)
        {
            _unitOfWork = unitOfWork;
            _dynastyRepository = dynastyRepository;
            _authorizationService = authorizationService;
        }

        public async Task HandleAsync(PatchDynastyCommand command, CancellationToken cancellationToken)
        {
            _authorizationService.RequireRole(Role.Master);

            var dynasty = await _dynastyRepository.Get(command.DynastyId, cancellationToken)
                ?? throw new InvalidOperationException($"Dynasty with id {command.DynastyId} not found.");

            var dynastyPatchDto = new DynastyPatchDto
            {
                Name = dynasty.Name,
                Description = dynasty.Description,
                Motto = dynasty.Motto,
                EstablishedYear = dynasty.EstablishedYear
            };

            command.PatchDocument.ApplyTo(dynastyPatchDto);

            var translatedFieldsChanged = dynastyPatchDto.Name != dynasty.Name
                || dynastyPatchDto.Description != dynasty.Description
                || dynastyPatchDto.Motto != dynasty.Motto;

            if (translatedFieldsChanged)
            {
                await _dynastyRepository.UpsertTranslation(
                    command.DynastyId,
                    dynastyPatchDto.Name,
                    dynastyPatchDto.Description,
                    dynastyPatchDto.Motto,
                    cancellationToken);
            }

            if (dynastyPatchDto.EstablishedYear.HasValue && dynastyPatchDto.EstablishedYear != dynasty.EstablishedYear)
                dynasty.SetEstablishedYear(dynastyPatchDto.EstablishedYear.Value);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
