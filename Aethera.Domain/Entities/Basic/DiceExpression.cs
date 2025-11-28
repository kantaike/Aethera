using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.Entities.Basic
{
    /// <summary>
    /// Represents a dice roll expression (e.g., 3d8 + 5). 
    /// </summary>
    public class DiceExpression
    {

        /// <summary>
        /// The constant modifier added to the roll result (e.g., the '5' in 3d8 + 5).
        /// </summary>
        public int ConstantModifier { get; private set; }

        /// <summary>
        /// The number of dice in the expression.
        /// </summary>
        public int DiceCount { get; private set; }

        /// <summary>
        /// The type of dice used (e.g., the '8' in 3d8 + 5).
        /// </summary>
        public int DiceSides { get; private set; }
        public DiceExpression() { }

        /// <summary>
        /// Initializes a new dice expression.
        /// </summary>
        /// <param name="diceCount">Number of dice to roll (e.g., 3).</param>
        /// <param name="diceType">An instance of the die type (e.g., new D8()).</param>
        /// <param name="modifier">Optional constant modifier to add (e.g., 5).</param>
        public DiceExpression(int diceCount, Dice diceType, int modifier = 0)
        {
            if (diceCount < 1)
            {
                throw new ArgumentOutOfRangeException(nameof(diceCount), "Must roll at least one die.");
            }

            ConstantModifier = modifier;
            DiceSides = diceType.Sides;
            DiceCount = diceCount;
        }

        /// <summary>
        /// Rolls the entire expression and returns the total result.
        /// </summary>
        /// <returns>The sum of all dice rolls plus the constant modifier.</returns>
        public int RollTotal()
        {
            var random = new Random();
            int sum = 0;
            for (int i = 0; i < DiceCount; i++)
            {
                var dice = new CustomDice(DiceSides); ;
                sum += dice.Roll();
            }
            return sum + ConstantModifier;
        }

    }
}
