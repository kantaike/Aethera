using Aethera.Domain.Common;

namespace Aethera.Infrastructure.Entities
{
    public class FactionTranslationEntity : Entity, ITranslationEntity
    {
        public Guid FactionId { get; set; }
        public required Culture Culture { get; set; }

        public string? Name { get; set; }
        public string? Description { get; set; }
    }
}
