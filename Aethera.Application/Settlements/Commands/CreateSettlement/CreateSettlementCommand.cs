using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Settlements;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace Aethera.Application.Settlements.Commands.CreateSettlement
{
    public record CreateSettlementCommand(
    string Title,
    string Description,
    int Population,
    SettlementType Type,
    Guid? RulerId = null,
    Guid? ProvinceId = null);

    public class CreateSettlementHandler : ICommandHandler<CreateSettlementCommand>
    {
        private readonly ISettlementRepository _repository;
        private readonly IUnitOfWork _uow;

        public CreateSettlementHandler(ISettlementRepository repository, IUnitOfWork uow)
        {
            _repository = repository;
            _uow = uow;
        }

        public async Task HandleAsync(CreateSettlementCommand command, CancellationToken ct)
        {
            Settlement settlement = command.Type switch
            {
                SettlementType.City => new City(command.Title, command.Description),
                SettlementType.Castle => new Castle(command.Title, command.Description),
                SettlementType.Village => new Village(command.Title, command.Description),
                _ => throw new ArgumentException("Unknown settlement type")
            };
            settlement.SetPopulation(command.Population);
            if (command.RulerId is Guid rulerId) settlement.SetRuler(rulerId);
            if (command.ProvinceId is Guid provinceId) settlement.SetProvince(provinceId);

            await _repository.Add(settlement, ct);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
