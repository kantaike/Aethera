using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Characters
{
    public class FactionRelation : Entities.Basic.EntitiesRelation<Faction, Guid>
    {
        public FactionRelation(Guid sourceId, Guid targetId, int value = 0, string? context = null)
            : base(sourceId, targetId, value, context)
        {
        }
    }
}
