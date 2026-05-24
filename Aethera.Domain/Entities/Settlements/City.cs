using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Settlements
{
    public class City : Settlement
    {
        private City()
        {
        }

        public City(string title, string description) : base(title, description)
        {
        }

    }
}
