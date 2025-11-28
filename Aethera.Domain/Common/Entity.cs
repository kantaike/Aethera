using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Common
{
    public class Entity
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public DateTime? CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public DateTime? DeletedAt { get; private set; }
        public EntityState? EntityState { get; private set; }
    }
    public enum EntityState
    {
        Updated,
        Disabled,
        Deleted
    }
}
