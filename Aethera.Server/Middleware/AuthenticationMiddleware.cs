using Aethera.Domain.Common;

namespace Aethera.Server.Middleware
{
    public class AuthenticationMiddleware(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context, ICultureProvider cultureProvider)
        {
            var culture = context.Request.Headers.AcceptLanguage.ToString();
            cultureProvider.SetCulture(cultureProvider.ToCulture(culture));

            await next(context);
        }
    }
}
