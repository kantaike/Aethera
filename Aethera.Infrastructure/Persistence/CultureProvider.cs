using Aethera.Domain.Common;

namespace Aethera.Server.Common
{
    public class CultureProvider : ICultureProvider
    {
        public Culture Culture { get; private set; }

        public void SetCulture(Culture culture)
        {
            Culture = culture;
        }

        public Culture ToCulture(string headerValue)
        {
            if (string.IsNullOrWhiteSpace(headerValue))
                return Culture.enUS;

            var primaryTag = headerValue
                .Split(',')
                .First()
                .Split(';')
                .First()
                .Replace("-", "")
                .Trim();

            if (Enum.TryParse<Culture>(primaryTag, ignoreCase: true, out var culture))
            {
                return culture;
            }

            // Fallback: match short language prefix (e.g. "en" -> enUS, "uk" -> ukUA)
            var match = Enum.GetValues<Culture>()
                .Cast<Culture?>()
                .FirstOrDefault(c => c.ToString()!.StartsWith(primaryTag, StringComparison.OrdinalIgnoreCase));

            return match ?? Culture.enUS;
        }
    }
}
