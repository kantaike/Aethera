using System;
using System.Collections.Generic;
using System.Text;

namespace Aethera.Application.Common.Interfaces
{
    public interface ICommandHandler<in TCommand>
    {
        Task HandleAsync(TCommand command, CancellationToken ct = default);
    }
}
