using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Common.Interfaces
{
    public interface IUnitOfWork
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
