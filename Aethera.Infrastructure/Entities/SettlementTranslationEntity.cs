using Aethera.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure.Entities
{
    /// <summary>
    /// Stores localized/translatable fields for a Settlement.
    /// Each record represents a single culture/locale for a settlement.
    /// </summary>
    public class SettlementTranslationEntity : Entity, ITranslationEntity
    {
        public Guid SettlementId { get; set; }

        public required Culture Culture { get; set; }

        public string? Title { get; set; }
        public string? Description { get; set; }
    }
}
