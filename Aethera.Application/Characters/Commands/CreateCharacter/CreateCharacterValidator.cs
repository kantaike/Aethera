using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Characters.Commands.CreateCharacter
{
    public class CreateCharacterValidator : AbstractValidator<CreateCharacterCommand>
    {
        public CreateCharacterValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name can't be empty")
                .MinimumLength(2).WithMessage("Name can't be less then 2 symbols")
                .MaximumLength(50).WithMessage("Name can't be longer than 30 symbols");

            RuleFor(x => x.Species)
                .IsInEnum().WithMessage("Non existing species");

            RuleFor(x => x.Class)
                .IsInEnum().WithMessage("Non existing class");
        }
    }
}
