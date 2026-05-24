using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Denominations.Commands.UpsertRelation
{
    public record UpsertDenominationRelationCommand(Guid SourceId, Guid TargetId, int Value, string? Context);

    public class UpsertDenominationRelationHandler(IDenominationRepository repository, IUnitOfWork uow)
        : ICommandHandler<UpsertDenominationRelationCommand>
    {
        public async Task HandleAsync(UpsertDenominationRelationCommand command, CancellationToken ct = default)
        {
            await repository.Get(command.SourceId, ct);
            await repository.Get(command.TargetId, ct);

            await repository.UpsertRelation(command.SourceId, command.TargetId, command.Value, command.Context, ct);
            await uow.SaveChangesAsync(ct);
        }
    }
}
