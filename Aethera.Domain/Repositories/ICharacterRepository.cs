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
        Task<Character> GetWithTranslation(Guid id, CancellationToken ct);
        Task<IEnumerable<Character>> GetAllWithTranslation(CancellationToken ct);
        Task<Character> AddWithTranslation(Character domainModel, CancellationToken ct);
        Task AddTranslation(Guid id, string? name, string? feats, string? backstory, string? personality);
        Task<IEnumerable<Character>> GetCharactersByDynasty(Guid dynastyId);
    }
}
