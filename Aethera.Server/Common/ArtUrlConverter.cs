using Aethera.Domain.ValueObjects;
using Newtonsoft.Json;

namespace Aethera.Server.Common
{
    public class ArtUrlConverter : JsonConverter<Art>
    {
        private readonly string _baseUrl;

        public ArtUrlConverter(string baseUrl)
        {
            _baseUrl = baseUrl?.EndsWith("/") == true ? baseUrl : (baseUrl ?? string.Empty) + "/";
        }

        public override void WriteJson(JsonWriter writer, Art? value, JsonSerializer serializer)
        {
            var fullUrl = $"{_baseUrl}{value?.FilePath.TrimStart('/')}";

            writer.WriteStartObject();
            writer.WritePropertyName("filePath");
            writer.WriteValue(fullUrl);
            writer.WriteEndObject();
        }

        public override Art? ReadJson(JsonReader reader, Type objectType, Art? existingValue, bool hasExistingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException("Deserialization not needed for now.");
        }

        public override bool CanRead => false;
    }
}
