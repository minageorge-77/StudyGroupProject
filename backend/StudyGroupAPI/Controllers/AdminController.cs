using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyGroupAPI.Application.DTOs.Admin;
using StudyGroupAPI.Application.Interfaces.Services;

namespace StudyGroupAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("group-creators/pending")]
    public async Task<IActionResult> GetPendingGroupCreators(CancellationToken cancellationToken)
    {
        var items = await _adminService.GetPendingGroupCreatorsAsync(cancellationToken);
        return Ok(items);
    }

    [HttpPut("group-creators/{userId:guid}/review")]
    public async Task<IActionResult> ReviewGroupCreator(Guid userId, [FromBody] CreatorDecisionRequestDto request, CancellationToken cancellationToken)
    {
        await _adminService.ReviewGroupCreatorAsync(userId, request, cancellationToken);
        return Ok(new { message = request.IsApproved ? "Group creator approved." : "Group creator rejected." });
    }
}
