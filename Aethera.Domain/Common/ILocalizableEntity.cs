using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Common
{
    public interface ILocalizableEntity<TTranslation>
    where TTranslation : class, ITranslationEntity
    {
        public ICollection<TTranslation> Translations { get; set; }
    }
}
