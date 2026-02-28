using Aethera.Application.Characters.Commands;
using Aethera.Application.Characters.Queries.GetCharacterDetails;
using Aethera.Application.Characters.Queries.GetCharactersList;
using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Factories;
using Aethera.Domain.Factories.Interfaces;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace Aethera.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.Scan(scan => scan
            .FromAssemblyOf<ICommandHandler<object>>()
            .AddClasses(classes => classes.AssignableToAny(
                typeof(ICommandHandler<>),
                typeof(IQueryHandler<,>),
                typeof(Aethera.Application.Users.Commands.LoginUser.LoginUserHandler)))
            .AsSelfWithInterfaces()
            .WithScopedLifetime());
            services.AddScoped<ICharacterFactory, CharacterFactory>();
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            return services;
        }
    }
}
