using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;
using System;

namespace Aethera.Application.Settlements.Commands.AddTranslation
{
    public record AddSettlementTranslationCommand(Guid Id, string? Title, string? Description);

    public class AddSettlementTranslationHandler : ICommandHandler<AddSettlementTranslationCommand>
    {
        private readonly ISettlementRepository _settlementRepository;
        private readonly IUnitOfWork _uow;

        public AddSettlementTranslationHandler(ISettlementRepository settlementRepository, IUnitOfWork uow)
        {
            _settlementRepository = settlementRepository;
            _uow = uow;
        }

        public async Task HandleAsync(AddSettlementTranslationCommand command, CancellationToken ct = default)
        {
            await _settlementRepository.AddTranslation(command.Id, command.Title, command.Description);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
