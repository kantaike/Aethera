using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Characters
{
    public class DenominationRelation : Entities.Basic.EntitiesRelation<Denomination, Guid>
    {
        public DenominationRelation(Guid sourceId, Guid targetId, int value = 0, string? context = null)
            : base(sourceId, targetId, value, context)
        {
        }

    }
}
