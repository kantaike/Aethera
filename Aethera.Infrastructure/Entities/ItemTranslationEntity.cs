using Aethera.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure.Entities
{
    /// <summary>
    /// Stores localized/translatable fields for an Item.
    /// Each record represents a single culture/locale for an item.
    /// </summary>
    public class ItemTranslationEntity : Entity, ITranslationEntity
    {
        public Guid ItemId { get; set; }

        public required Culture Culture { get; set; }

        public string? Name { get; set; }
        public string? Description { get; set; }
    }
}
