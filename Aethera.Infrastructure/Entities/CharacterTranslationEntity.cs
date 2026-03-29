using Aethera.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure.Entities
{
    public class CharacterTranslationEntity : Entity, ITranslationEntity
    {
        // Foreign key to the Character entity this translation belongs to
        public Guid CharacterId { get; set; }

        // Culture / locale identifier (e.g. "en-US", "fr-FR")
        public required Culture Culture { get; set; }

        // Translatable/display properties from domain Character
        public string? Name { get; set; }
        public string? Feats { get; set; }
        public string? Backstory { get; set; }
        public string? Personality { get; set; }
    }
}
