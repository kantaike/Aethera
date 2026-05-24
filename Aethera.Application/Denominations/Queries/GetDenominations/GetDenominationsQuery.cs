using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Denominations.Queries.GetDenominations
{
    public record GetDenominationsQuery();
    public record DenominationDto(Guid Id, string Name, string? Description, string? Tenets, string? Appearance, Religion Religion, Guid? LeaderId);

    public class GetDenominationsHandler(IDenominationRepository repository)
        : IQueryHandler<GetDenominationsQuery, IEnumerable<DenominationDto>>
    {
        public async Task<IEnumerable<DenominationDto>> HandleAsync(GetDenominationsQuery query, CancellationToken ct)
        {
            var denominations = await repository.Get(ct);

            return denominations.Select(d => new DenominationDto(
                d.Id,
                d.Name ?? string.Empty,
                d.Description,
                d.Tenets,
                d.Appearance,
                d.Religion,
                d.LeaderId));
        }
    }
}
