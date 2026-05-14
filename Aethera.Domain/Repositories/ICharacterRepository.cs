using Aethera.Domain.Common;
using Aethera.Domain.Entities.Characters;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Repositories
{
    public interface ICharacterRepository : IRepository<Character>
    {
        Task<List<RelativeDto>> GetFamilyTree(Guid characterId, CancellationToken ct);
        Task AddTranslation(Guid id, string? name, string? feats, string? backstory, string? personality);
        Task UpsertTraitsAndFeaturesTranslation(Guid id, string? feats, string? backstory, string? personality, CancellationToken ct);
        Task<IEnumerable<Character>> GetCharactersByDynasty(Guid dynastyId);
    }
}
