using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Domain.ValueObjects
{
    public record Art
    {
        public string FilePath { get; private set; }

        private Art(string filePath) => FilePath = filePath;

        public static Art Create(string fileName, string folder)
        {
            var extension = Path.GetExtension(fileName).ToLower();
            string[] allowed = { ".svg", ".jpg", ".jpeg", ".png" };

            if (!allowed.Contains(extension))
                throw new Exception("Unsupported image format");

            return new Art($"{folder}/{Guid.NewGuid()}{extension}");
        }
    }
}
