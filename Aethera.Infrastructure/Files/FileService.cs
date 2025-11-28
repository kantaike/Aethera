using Aethera.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Infrastructure.Files
{
    public class FileService : IFileService
    {
        private readonly string _storagePath;
        public FileService(IConfiguration configuration)
        {
            _storagePath = configuration["StoragePath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        public async Task SaveFileAsync(Stream fileStream, string relativePath)
        {
            var fullPath = Path.Combine(_storagePath, relativePath);
            var directory = Path.GetDirectoryName(fullPath);
            if (!string.IsNullOrEmpty(directory)) Directory.CreateDirectory(directory);

            using var stream = new FileStream(fullPath, FileMode.Create);
            await fileStream.CopyToAsync(stream);
        }
    }
}
