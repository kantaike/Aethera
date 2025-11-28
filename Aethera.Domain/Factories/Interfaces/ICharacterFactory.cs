using Aethera.Domain.Entities.Characters;
using System;

namespace Aethera.Domain.Factories.Interfaces
{
    public interface ICharacterFactory
    {
        public Character CreateCharacter(string name, Species species, CharacterClass @class,
            int strength, int dexterity, int constitution,
            int intelligence, int wisdom, int charisma);

        public Character CreateCharacter(string name, Species species, CharacterClass @class);

        public Character CreateCharacterDetailed(string name, Species species, CharacterClass? @class, Action<Character>? configure = null);
    }
}
