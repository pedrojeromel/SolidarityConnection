using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Solidarity.Domain.Enums;

namespace Solidarity.Api.Tests.Infrastructure;

public static class AuthenticatedControllerContext
{
    public static ControllerContext For(
        Guid userId,
        UserRole role = UserRole.Donor)
    {
        var identity = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role.ToString())
            ],
            authenticationType: "TestAuth");

        return new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };
    }
}
