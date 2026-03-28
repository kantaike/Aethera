using Aethera.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure.Entities
{
    /// <summary>
    /// Stores localized/translatable fields for a Dynasty.
    /// Each record represents a single culture/locale for a dynasty.
    /// </summary>
    public class DynastyTranslationEntity : Entity, ITranslationEntity
    {
        public Guid DynastyId { get; set; }

        public required Culture Culture { get; set; }

        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Motto { get; set; }
    }
}
