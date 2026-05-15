using Aethera.Application.Common.Interfaces;
using Aethera.Domain.Entities.Users;
using Aethera.Domain.Repositories;
using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using System.Security;

namespace Aethera.Application.Common.Authorization
{
    /// <summary>
    /// Provides authorization utilities for command handlers
    /// </summary>
    public interface IAuthorizationService
    {
        Guid GetCurrentUserId();
        Role? GetUserRole();
        void RequireRole(Role requiredRole);
    }

    public class AuthorizationService : IAuthorizationService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserRepository _userRepository;

        public AuthorizationService(IHttpContextAccessor httpContextAccessor, IUserRepository userRepository)
        {
            _httpContextAccessor = httpContextAccessor;
            _userRepository = userRepository;
        }

        public Guid GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("User not authenticated.");
            return userId;
        }

        public Role? GetUserRole()
        {
            var userId = GetCurrentUserId();
            var user = _userRepository.Get(userId, default).GetAwaiter().GetResult();
            return user?.Role;
        }

        public void RequireRole(Role requiredRole)
        {
            var userRole = GetUserRole();
            if (userRole != requiredRole)
                throw new SecurityException($"This operation requires {requiredRole} role. Your role: {userRole}.");
        }
    }
}
