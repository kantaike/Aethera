using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Common.Interfaces
{
    public interface IQueryHandler<in TQuery, TResult>
    {
        Task<TResult> HandleAsync(TQuery query, CancellationToken ct = default);
    }
}
