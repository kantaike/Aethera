using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.AdministrativeUnits;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace Aethera.Application.AdministrativeUnits.Commands.CreateAdministrativeUnit
{
    public record CreateAdministrativeUnitCommand(
    string Title,
    AdministrativeUnitType Type,
    string? Description = null,
    Guid? RulerId = null,
    Guid? ParentId = null
);

    public class CreateAdministrativeUnitHandler : ICommandHandler<CreateAdministrativeUnitCommand>
    {
        private readonly IAdministrativeUnitRepository _repository;
        private readonly IUnitOfWork _uow;

        public CreateAdministrativeUnitHandler(IAdministrativeUnitRepository repository, IUnitOfWork uow)
        {
            _repository = repository;
            _uow = uow;
        }

        public async Task HandleAsync(CreateAdministrativeUnitCommand command, CancellationToken ct)
        {
            AdministrativeUnit unit = command.Type switch
            {
                AdministrativeUnitType.Country => new Country(command.Title, command.Description, command.RulerId, command.ParentId),
                AdministrativeUnitType.Region => new Region(command.Title, command.Description, command.RulerId, command.ParentId),
                AdministrativeUnitType.Province => new Province(command.Title, command.Description, command.RulerId, command.ParentId),
                _ => throw new ArgumentException("Invalid unit type")
            };

            await _repository.Add(unit, ct);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
