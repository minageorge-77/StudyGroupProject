using Microsoft.AspNetCore.Mvc;
using StudyGroupAPI.Application.DTOs.Auth;
using StudyGroupAPI.Application.Interfaces.Services;

namespace StudyGroupAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register/student")]
    public async Task<IActionResult> RegisterStudent([FromBody] RegisterStudentRequestDto request, CancellationToken cancellationToken)
    {
        await _authService.RegisterStudentAsync(request, cancellationToken);
        return Ok(new { message = "Student account registered successfully." });
    }

    [HttpPost("register/group-creator")]
    public async Task<IActionResult> RegisterGroupCreator([FromBody] RegisterGroupCreatorRequestDto request, CancellationToken cancellationToken)
    {
        await _authService.RegisterGroupCreatorAsync(request, cancellationToken);
        return Ok(new { message = "Group creator account submitted for admin approval." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.LoginAsync(request, cancellationToken);
        return Ok(response);
    }
}
