using Aethera.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Aethera.Infrastructure.Files
{
    internal class CloudinaryFileService : IFileService
    {
        private readonly string _baseUrl;
        private readonly string _apiKey;
        private readonly string _apiSecret;

        public CloudinaryFileService(IConfiguration configuration)
        {
            _baseUrl = configuration["Cloudinary:BaseUrl"];
            _apiKey = configuration["Cloudinary:ApiKey"];
            _apiSecret = configuration["Cloudinary:ApiSecret"];
        }

        public async Task SaveFileAsync(Stream fileStream, string relativePath)
        {
            if (string.IsNullOrWhiteSpace(_baseUrl) || string.IsNullOrWhiteSpace(_apiKey) || string.IsNullOrWhiteSpace(_apiSecret))
            {
                throw new InvalidOperationException("Cloudinary configuration is missing.");
            }

            if (fileStream.CanSeek)
            {
                fileStream.Position = 0;
            }

            var normalizedPath = relativePath.Replace("\\", "/").TrimStart('/');
            var folder = Path.GetDirectoryName(normalizedPath)?.Replace("\\", "/");
            var publicId = Path.GetFileNameWithoutExtension(normalizedPath);
            var extension = Path.GetExtension(normalizedPath).ToLowerInvariant();
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();

            using var memory = new MemoryStream();
            await fileStream.CopyToAsync(memory);
            var base64File = Convert.ToBase64String(memory.ToArray());
            var mimeType = GetMimeType(extension);
            var fileDataUri = $"data:{mimeType};base64,{base64File}";

            var signedParameters = new SortedDictionary<string, string>(StringComparer.Ordinal)
            {
                ["public_id"] = publicId,
                ["timestamp"] = timestamp,
                ["overwrite"] = "true"
            };

            if (!string.IsNullOrWhiteSpace(folder))
            {
                signedParameters["folder"] = folder;
            }

            var signature = BuildSignature(signedParameters);

            var form = new List<KeyValuePair<string, string>>
            {
                new("file", fileDataUri),
                new("public_id", publicId),
                new("timestamp", timestamp),
                new("overwrite", "true"),
                new("api_key", _apiKey),
                new("signature", signature)
            };

            if (!string.IsNullOrWhiteSpace(folder))
            {
                form.Add(new("folder", folder));
            }

            using var client = new HttpClient();
            using var content = new FormUrlEncodedContent(form);
            var response = await client.PostAsync(_baseUrl, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Cloudinary error: {responseBody}");
            }

            using var json = JsonDocument.Parse(responseBody);
            _ = json.RootElement.TryGetProperty("public_id", out _);
        }

        private string BuildSignature(IReadOnlyDictionary<string, string> parameters)
        {
            var toSign = string.Join("&", parameters.Select(kvp => $"{kvp.Key}={kvp.Value}")) + _apiSecret;
            var hash = SHA1.HashData(Encoding.UTF8.GetBytes(toSign));
            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        private static string GetMimeType(string extension) => extension switch
        {
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".svg" => "image/svg+xml",
            _ => "application/octet-stream"
        };
    }
}
