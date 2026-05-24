using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Factions.Commands.UpsertRelation
{
    public record UpsertFactionRelationCommand(Guid SourceId, Guid TargetId, int Value, string? Context);

    public class UpsertFactionRelationHandler(IFactionRepository repository, IUnitOfWork uow)
        : ICommandHandler<UpsertFactionRelationCommand>
    {
        public async Task HandleAsync(UpsertFactionRelationCommand command, CancellationToken ct = default)
        {
            await repository.Get(command.SourceId, ct);
            await repository.Get(command.TargetId, ct);

            await repository.UpsertRelation(command.SourceId, command.TargetId, command.Value, command.Context, ct);
            await uow.SaveChangesAsync(ct);
        }
    }
}
