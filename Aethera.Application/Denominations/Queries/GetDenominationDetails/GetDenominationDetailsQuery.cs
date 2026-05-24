using Aethera.Application.Common.Interfaces;
using Aethera.Application.Denominations.Queries.GetDenominations;
using Aethera.Domain.Repositories;

namespace Aethera.Application.Denominations.Queries.GetDenominationDetails
{
    public record GetDenominationDetailsQuery(Guid Id);

    public class GetDenominationDetailsHandler(IDenominationRepository repository)
        : IQueryHandler<GetDenominationDetailsQuery, DenominationDto?>
    {
        public async Task<DenominationDto?> HandleAsync(GetDenominationDetailsQuery query, CancellationToken ct)
        {
            var denomination = await repository.Get(query.Id, ct);

            return new DenominationDto(
                denomination.Id,
                denomination.Name ?? string.Empty,
                denomination.Description,
                denomination.Tenets,
                denomination.Appearance,
                denomination.Religion,
                denomination.LeaderId);
        }
    }
}
