using Aethera.Domain.Common;

namespace Aethera.Infrastructure.Entities
{
    public class DenominationTranslationEntity : Entity, ITranslationEntity
    {
        public Guid DenominationId { get; set; }
        public required Culture Culture { get; set; }

        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Tenets { get; set; }
        public string? Appearance { get; set; }
    }
}
