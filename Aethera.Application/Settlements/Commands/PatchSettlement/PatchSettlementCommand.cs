using Aethera.Application.Common.Interfaces;
using Aethera.Application.Common.Authorization;
using Aethera.Domain.Entities.Settlements;
using Aethera.Domain.Entities.Users;
using Aethera.Domain.Repositories;
using Microsoft.AspNetCore.JsonPatch;
using System;

namespace Aethera.Application.Settlements.Commands.PatchSettlement
{
    /// <summary>
    /// DTO for settlement updates via JsonPatch
    /// </summary>
    public class SettlementPatchDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? Population { get; set; }
        public SettlementType? Type { get; set; }
        public Guid? RulerId { get; set; }
        public Guid? ProvinceId { get; set; }
    }

    /// <summary>
    /// Generic JsonPatch command for settlement updates
    /// Applies patches and then updates the domain entity using business logic methods
    /// </summary>
    public record PatchSettlementCommand
    {
        public Guid SettlementId { get; init; }
        public JsonPatchDocument<SettlementPatchDto> PatchDocument { get; init; } = new();
    }

    public class PatchSettlementHandler : ICommandHandler<PatchSettlementCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISettlementRepository _settlementRepository;
        private readonly IAuthorizationService _authorizationService;

        public PatchSettlementHandler(IUnitOfWork unitOfWork, ISettlementRepository settlementRepository, IAuthorizationService authorizationService)
        {
            _unitOfWork = unitOfWork;
            _settlementRepository = settlementRepository;
            _authorizationService = authorizationService;
        }

        public async Task HandleAsync(PatchSettlementCommand command, CancellationToken cancellationToken)
        {
            _authorizationService.RequireRole(Role.Master);

            var settlement = await _settlementRepository.Get(command.SettlementId, cancellationToken)
                ?? throw new InvalidOperationException($"Settlement with id {command.SettlementId} not found.");

            var settlementPatchDto = new SettlementPatchDto
            {
                Title = settlement.Title,
                Description = settlement.Description,
                Population = settlement.Population,
                Type = settlement.Type,
                RulerId = settlement.RulerId,
                ProvinceId = settlement.ProvinceId
            };

            command.PatchDocument.ApplyTo(settlementPatchDto);

            var translatedFieldsChanged = settlementPatchDto.Title != settlement.Title
                || settlementPatchDto.Description != settlement.Description;

            if (translatedFieldsChanged)
            {
                await _settlementRepository.UpsertTranslation(
                    command.SettlementId,
                    settlementPatchDto.Title,
                    settlementPatchDto.Description,
                    cancellationToken);
            }

            if (settlementPatchDto.Population.HasValue && settlementPatchDto.Population != settlement.Population)
                settlement.SetPopulation(settlementPatchDto.Population.Value);

            if (settlementPatchDto.Type.HasValue && settlementPatchDto.Type != settlement.Type)
                settlement.SetType(settlementPatchDto.Type.Value);

            if (settlementPatchDto.RulerId.HasValue && settlementPatchDto.RulerId != settlement.RulerId)
                settlement.SetRuler(settlementPatchDto.RulerId.Value);

            if (settlementPatchDto.ProvinceId.HasValue && settlementPatchDto.ProvinceId != settlement.ProvinceId)
                settlement.SetProvince(settlementPatchDto.ProvinceId.Value);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
