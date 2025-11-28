using Aethera.Application.Characters.Queries.GetCharacterDetails;
using Aethera.Application.Common;
using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Characters;
using Aethera.Domain.Repositories;
using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Characters.Queries.GetCharactersList
{
    public record GetCharactersQuery();
    public record CharacterPreview(Guid Id, string Name, Species species, CharacterClass? @class, HitPoints? HP, int Level, Art? Art, Guid? DynastyId);

    public class GetCharacterQueryHandler : IQueryHandler<GetCharactersQuery, IEnumerable<CharacterPreview>>
    {
        private readonly ICharacterRepository _repository;

        public GetCharacterQueryHandler(ICharacterRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<CharacterPreview>> HandleAsync(GetCharactersQuery query, CancellationToken ct = default)
        {
            var characters = await _repository.GetAllWithTranslation(ct);

            return characters.Select(character => new CharacterPreview(
                character.Id,
                character.Name ?? Constants.UnknownCharacter,
                character.Species,
                character.Class,
                character.HP,
                character.Level,
                character.Art,
                character.DynastyId
            ));
        }

    }
}
