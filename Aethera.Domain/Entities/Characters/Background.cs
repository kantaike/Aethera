using Aethera.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Characters
{
    public class Background : Entity
    {
        public string? Name { get; private set; }
        public string? Description { get; private set; }
    }
}
