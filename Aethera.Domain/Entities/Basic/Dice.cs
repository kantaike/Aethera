using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Basic
{
    /// <summary>
    /// Base class for all dice types (d4, d6, d20, etc.).
    /// Encapsulates the core rolling logic.
    /// </summary>
    public class Dice
    {
        private static readonly Random RandomGenerator = new();

        /// <summary>
        /// The number of sides on the die.
        /// </summary>
        public int Sides { get; private set; }

        protected Dice(int sides)
        {
            if (sides <= 1)
            {
                throw new ArgumentOutOfRangeException(nameof(sides), "A die must have 2 or more sides.");
            }
            Sides = sides;
        }

        /// <summary>
        /// Performs a single standard roll (1 to Sides).
        /// </summary>
        /// <returns>The result of the single roll.</returns>
        public virtual int Roll()
        {
            // Generates a number between 1 (inclusive) and Sides + 1 (exclusive)
            return RandomGenerator.Next(1, Sides + 1);
        }

        /// <summary>
        /// Performs a roll with advantage or disadvantage.
        /// </summary>
        /// <param name="isAdvantage">If true, rolls with advantage (take max). If false, rolls with disadvantage (take min).</param>
        /// <returns>The result of the roll after applying advantage/disadvantage rule.</returns>
        public virtual int RollWithModifier(bool isAdvantage)
        {
            // For advantage/disadvantage, two dice are rolled, and the best/worst is kept.
            int roll1 = Roll();
            int roll2 = Roll();

            return isAdvantage ? Math.Max(roll1, roll2) : Math.Min(roll1, roll2);
        }
    }
    /// <summary>
    /// A four-sided die (d4).
    /// </summary>
    public sealed class D4 : Dice
    {
        public D4() : base(4) { }
    }

    /// <summary>
    /// A six-sided die (d6).
    /// </summary>
    public sealed class D6 : Dice
    {
        public D6() : base(6) { }
    }

    /// <summary>
    /// An eight-sided die (d8).
    /// </summary>
    public sealed class D8 : Dice
    {
        public D8() : base(8) { }
    }

    /// <summary>
    /// A ten-sided die (d10).
    /// </summary>
    public sealed class D10 : Dice
    {
        public D10() : base(10) { }
    }

    /// <summary>
    /// A twelve-sided die (d12).
    /// </summary>
    public sealed class D12 : Dice
    {
        public D12() : base(12) { }
    }

    /// <summary>
    /// A twenty-sided die (d20), commonly used for attack rolls and ability checks.
    /// </summary>
    public sealed class D20 : Dice
    {
        public D20() : base(20) { }
    }

    /// <summary>
    /// A generic die for non-standard counts (d3, d100, etc.).
    /// </summary>
    public sealed class CustomDice(int sides) : Dice(sides)
    {
    }
}
