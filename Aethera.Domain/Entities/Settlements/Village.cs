using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Settlements
{
    public class Village : Settlement
    {
        private Village()
        {
        }

        public Village(string title, string description) : base(title, description)
        {
        }

    }
}
