using Aethera.Domain.ValueObjects;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Aethera.Server.Common
{
    public class ArtUrlConverter : JsonConverter<Art>
    {
        private readonly string _baseUrl;

        public ArtUrlConverter(string baseUrl)
        {
            _baseUrl = baseUrl.EndsWith("/") ? baseUrl : baseUrl + "/";
        }

        public override void Write(Utf8JsonWriter writer, Art value, JsonSerializerOptions options)
        {
            var fullUrl = $"{_baseUrl}{value.FilePath.TrimStart('/')}";

            writer.WriteStartObject();
            writer.WriteString("filePath", fullUrl);
            writer.WriteEndObject();
        }

        public override Art? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotImplementedException("Deserialization not needed for now.");
        }
    }
}
