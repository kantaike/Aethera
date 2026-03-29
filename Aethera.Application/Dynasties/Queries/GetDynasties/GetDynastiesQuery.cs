using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.AdministrativeUnits;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Entities.Settlements;
using Aethera.Domain.Repositories;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Aethera.Application.Dynasties.Queries.GetDynasties
{
    public record DynastyDto(Guid Id, string Name, string Description, Art? Art, string? Motto, int? EstablishedYear, int? Power, DynastyStatus? Status);

    public record GetDynastiesQuery();
    public class GetDynastiesHandler(IDynastyRepository repository,
                                    ICharacterRepository characterRepository,
                                    IAdministrativeUnitRepository administrativeUnitRepository,
                                    IRepository<Settlement> settlementRepository) : IQueryHandler<GetDynastiesQuery, IEnumerable<DynastyDto>>
    {
        public async Task<IEnumerable<DynastyDto>> HandleAsync(GetDynastiesQuery query, CancellationToken ct)
        {
            var dynasties = (await repository.Get(ct)).ToList();

            var result = new List<DynastyDto>();

            foreach (var d in dynasties)
            {
                // Reuse centralised calculation
                var derived = await DynastyCalculator.CalculateAsync(d,
                                                                      characterRepository,
                                                                      administrativeUnitRepository,
                                                                      settlementRepository,
                                                                      ct);

                result.Add(new DynastyDto(
                    d.Id,
                    d.Name ?? string.Empty,
                    d.Description ?? string.Empty,
                    d.Art,
                    d.Motto,
                    d.EstablishedYear,
                    derived.TotalPower,
                    derived.Status));
            }

            return result;
        }
    }

    // Computed result to be reused by other handlers (e.g. GetDynastyById)
    public sealed record DynastyDerivedInfo(int TotalPower, DynastyStatus Status, int LivingCount);

    public static class DynastyCalculator
    {
        public static async Task<DynastyDerivedInfo> CalculateAsync(Dynasty dynasty,
                                                                    ICharacterRepository characterRepository,
                                                                    IAdministrativeUnitRepository administrativeUnitRepository,
                                                                    IRepository<Settlement> settlementRepository,
                                                                    CancellationToken ct)
        {
            if (dynasty is null) throw new ArgumentNullException(nameof(dynasty));

            // Load characters belonging to the dynasty
            var members = (await characterRepository.GetCharactersByDynasty(dynasty.Id)).ToList();
            var memberIds = new HashSet<Guid>(members.Select(m => m.Id));

            // Count living members
            var livingCount = members.Count(m => m.Status == CharacterStatus.Alive);

            // Preload admin units and settlements to avoid querying inside loops
            var adminUnits = (await administrativeUnitRepository.Get(ct)).OfType<AdministrativeUnit>().ToList();
            var settlements = (await settlementRepository.Get(ct)).ToList();

            // Title / Power calculation based on rulers among members
            var hasCountryRuler = adminUnits.Any(a => a.Type == AdministrativeUnitType.Country && a.RulerId != null && memberIds.Contains(a.RulerId.Value));
            var hasRegionRuler = adminUnits.Any(a => a.Type == AdministrativeUnitType.Region && a.RulerId != null && memberIds.Contains(a.RulerId.Value));
            var hasCityRuler = settlements.Any(s => s.Type == SettlementType.City && s.RulerId != null && memberIds.Contains(s.RulerId.Value));

            int power = 0;
            if (hasCountryRuler) power = 2;
            else if (hasRegionRuler || hasCityRuler) power = 1;
            power = Math.Min(2, power);

            // Settlements scoring: owns capital (approximated as being country ruler) or >2 settlements
            var ownedSettlementsCount = settlements.Count(s => s.RulerId != null && memberIds.Contains(s.RulerId.Value));
            int settlementsScore = (hasCountryRuler || ownedSettlementsCount > 2) ? 1 : 0;

            // Population scoring
            int populationScore = livingCount > 5 ? 1 : 0;

            // Drevnost (age) scoring: if any dynasty member has >3 generations of ancestors in returned family tree
            int ageScore = 0;
            foreach (var member in members)
            {
                var relatives = await characterRepository.GetFamilyTree(member.Id, ct);
                // Build map of id -> parent ids for relatives
                var map = relatives.ToDictionary(r => r.Id, r => (FatherId: r.FatherId, MotherId: r.MotherId));
                // Ensure the member node is included (in case GetFamilyTree does not include start node)
                map[member.Id] = (member.FatherId, member.MotherId);

                int GetDepth(Guid id, HashSet<Guid> visited)
                {
                    if (id == Guid.Empty || !map.ContainsKey(id)) return 0;
                    if (!visited.Add(id)) return 0; // prevent cycles
                    var (father, mother) = map[id];
                    int fatherDepth = father.HasValue ? 1 + GetDepth(father.Value, visited) : 0;
                    int motherDepth = mother.HasValue ? 1 + GetDepth(mother.Value, visited) : 0;
                    return Math.Max(fatherDepth, motherDepth);
                }

                var depth = GetDepth(member.Id, new HashSet<Guid>());
                // depth counts generations (1 = parent). We need >3 generations of ancestors => depth >= 4
                if (depth >= 4)
                {
                    ageScore = 1;
                    break;
                }
            }

            var totalPower = power + populationScore + settlementsScore + ageScore;
            // Determine dynasty status
            var status = DynastyStatus.Vassal;
            if (livingCount == 0) status = DynastyStatus.Fallen;
            else if (hasCountryRuler) status = DynastyStatus.Ruling;
            else status = DynastyStatus.Vassal;

            return new DynastyDerivedInfo(totalPower, status, livingCount);
        }
    }
}
