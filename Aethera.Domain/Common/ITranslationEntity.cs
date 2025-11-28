using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Common
{
    public interface ITranslationEntity
    {
        Culture Culture { get; set; }
    }
    public enum Culture
    {
        enUS,
        ukUA
    }
}
