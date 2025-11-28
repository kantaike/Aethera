using Aethera.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Common
{
    public enum EntityArtType
    {
        Character,
        Item,
        Settlement,
        Dynasty
    }
    public interface IHasArt
    {
        Art? Art { get; }
        void SetArt(Art art);
    }
}
