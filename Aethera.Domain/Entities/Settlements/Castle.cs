using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Settlements
{
    public class Castle : Settlement
    {
        private Castle()
        {
        }

        public Castle(string title, string description) : base(title, description)
        {
        }

    }
}
