using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.AdministrativeUnits.Queries.GetAdministrativeUnits
{
    public record AdministrativeUnitDto(Guid Id, string Title, string Type, Guid? RulerId, Guid? ParentId);
    public record GetAdministrativeUnitsQuery();

    public class GetAdminUnitsHandler : IQueryHandler<GetAdministrativeUnitsQuery, IEnumerable<AdministrativeUnitDto>>
    {
        private readonly IAdministrativeUnitRepository _repository;
        public GetAdminUnitsHandler(IAdministrativeUnitRepository repository) => _repository = repository;

        public async Task<IEnumerable<AdministrativeUnitDto>> HandleAsync(GetAdministrativeUnitsQuery query, CancellationToken ct)
        {
            var units = await _repository.Get(ct);
            return units.Select(u => new AdministrativeUnitDto(u.Id, u.Title ?? "Unknown", u.Type.ToString(), u.RulerId, u.ParentId));
        }
    }
}
