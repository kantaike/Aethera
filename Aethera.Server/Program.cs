using Aethera.Application;
using Aethera.Application.Common.Authorization;
using Aethera.Domain.Entities.Users;
using Aethera.Infrastructure;
using Aethera.Infrastructure.Persistence;
using Aethera.Server.Common;
using Aethera.Server.Middleware;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Security;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddHttpContextAccessor();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true).AddEnvironmentVariables().Build());
var storageBaseUrl = builder.Configuration["StorageSettings:ProdUrl"];

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressModelStateInvalidFilter = true;
    })
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.Converters.Add(new Newtonsoft.Json.Converters.StringEnumConverter());
        options.SerializerSettings.Converters.Add(new ArtUrlConverter(storageBaseUrl));
    });

// For System.Text.Json (if needed elsewhere)
builder.Services.Configure<JsonOptions>(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("VercelPolicy", policy =>
    {
        policy.WithOrigins("https://aethera-alpha.vercel.app", "https://localhost:62905")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Register Swagger/OpenAPI services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddOpenApi();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        if (context.Database.GetPendingMigrations().Any())
        {
            context.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}
app.UseMiddleware<AuthenticationMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseDefaultFiles();
app.MapStaticAssets();

var swaggerEnabled = builder.Configuration.GetValue<bool?>("Swagger:Enabled") ?? app.Environment.IsDevelopment();
var allowSwaggerInProduction = builder.Configuration.GetValue<bool>("Swagger:AllowInProduction");
var canExposeSwagger = swaggerEnabled && (!app.Environment.IsProduction() || allowSwaggerInProduction);

if (canExposeSwagger)
{
    app.UseWhen(
        context =>
            context.Request.Path.StartsWithSegments("/internal-docs") ||
            context.Request.Path.StartsWithSegments("/secret-api-docs") ||
            context.Request.Path.StartsWithSegments("/openapi"),
        branch =>
        {
            branch.Use(async (context, next) =>
            {
                var authorizationService = context.RequestServices.GetRequiredService<IAuthorizationService>();
                await next(context);
            });
        });

    app.UseSwagger(c => { c.RouteTemplate = "secret-api-docs/{documentname}/swagger.json"; });
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/secret-api-docs/v1/swagger.json", "Aethera API V1");
        c.RoutePrefix = "internal-docs";
    });
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("VercelPolicy");

app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
