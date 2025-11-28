using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Common.Interfaces
{
    public interface IFileService
    {
        Task SaveFileAsync(Stream fileStream, string relativePath);
    }
}
