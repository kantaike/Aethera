using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Common;
using Aethera.Domain.Repositories;
using Aethera.Infrastructure.Files;
using Aethera.Infrastructure.Persistence;
using Aethera.Infrastructure.Repositories;
using Aethera.Server.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString, b =>
                    b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));
            services.AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>());

            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<ICharacterRepository, CharacterRepository>();
            services.AddScoped<IItemRepository, ItemRepository>();
            services.AddScoped<ISettlementRepository, SettlemmentRepository>();
            services.AddScoped<IAdministrativeUnitRepository, AdministrativeUnitRepository>();
            services.AddScoped<IDynastyRepository, DynastyRepository>();
            services.AddScoped<IUserRepository, UserRepository>();

            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IMapper, AutoMapperWrapper>();
            services.AddScoped<ICultureProvider, CultureProvider>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }
    }
}
