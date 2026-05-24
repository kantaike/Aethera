using Aethera.Domain.Common;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace Aethera.Server.Middleware
{
    public class AuthenticationMiddleware(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context, ICultureProvider cultureProvider, IConfiguration configuration)
        {
            var culture = context.Request.Headers.AcceptLanguage.ToString();
            cultureProvider.SetCulture(cultureProvider.ToCulture(culture));

            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var secretKey = configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("JWT secret key not configured");
                    var key = Encoding.ASCII.GetBytes(secretKey);
                    tokenHandler.ValidateToken(token, new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ClockSkew = TimeSpan.Zero
                    }, out SecurityToken validatedToken);

                    var jwtToken = (JwtSecurityToken)validatedToken;
                    var userId = jwtToken.Claims.First(x => x.Type == "nameid").Value;
                    var username = jwtToken.Claims.First(x => x.Type == "unique_name").Value;
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, userId),
                        new Claim(ClaimTypes.Name, username)
                    };
                    var identity = new ClaimsIdentity(claims, "jwt");
                    context.User = new ClaimsPrincipal(identity);
                }
                catch
                {
                    // Token is not valid, ignore and continue without authentication
                }
            }

            await next(context);
        }
    }
}
