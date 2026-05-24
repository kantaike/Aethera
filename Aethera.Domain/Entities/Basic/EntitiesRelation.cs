using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Basic
{
    public abstract class EntitiesRelation<TEntity, TKey>
    where TEntity : class
    where TKey : struct
    {
        private EntitiesRelation() { }
        public EntitiesRelation(TKey sourceId, TKey targetId, int value = 0, string? context = null)
        {
            SourceId = sourceId;
            TargetId = targetId;
            Value = value;
            Context = context;
        }
        public TKey SourceId { get; set; }
        public TEntity Source { get; set; }

        public TKey TargetId { get; set; }
        public TEntity Target { get; set; }

        private int _value;
        public int Value
        {
            get => _value;
            set
            {
                if (value > -100 && value < 100)
                {
                    _value = value;
                }
            }
        }
        public string? Context { get; set; }
    }
}
