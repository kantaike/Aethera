using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Common
{
    public interface ICultureProvider
    {
        Culture Culture { get; }
        void SetCulture(Culture culture);
        Culture ToCulture(string culture);
    }
}
