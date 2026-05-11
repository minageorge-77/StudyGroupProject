using StudyGroupAPI.Application.DTOs.Admin;
using StudyGroupAPI.Application.Interfaces.Repositories;
using StudyGroupAPI.Application.Interfaces.Services;
using StudyGroupAPI.Domain.Enums;

namespace StudyGroupAPI.Application.Services;

public class AdminService : IAdminService
{
    private readonly IGroupCreatorProfileRepository _groupCreatorProfileRepository;
    private readonly IUserRepository _userRepository;

    public AdminService(
        IGroupCreatorProfileRepository groupCreatorProfileRepository,
        IUserRepository userRepository)
    {
        _groupCreatorProfileRepository = groupCreatorProfileRepository;
        _userRepository = userRepository;
    }

    public async Task<IReadOnlyCollection<PendingGroupCreatorDto>> GetPendingGroupCreatorsAsync(CancellationToken cancellationToken)
    {
        var pending = await _groupCreatorProfileRepository.GetPendingAsync(cancellationToken);
        return pending.Select(x => new PendingGroupCreatorDto
        {
            UserId = x.UserId,
            FullName = x.User.FullName,
            Email = x.User.Email,
            RequestedAtUtc = x.RequestedAtUtc
        }).ToList();
    }

    public async Task ReviewGroupCreatorAsync(Guid userId, CreatorDecisionRequestDto request, CancellationToken cancellationToken)
    {
        var profile = await _groupCreatorProfileRepository.GetByUserIdAsync(userId, cancellationToken)
            ?? throw new InvalidOperationException("Group creator request not found.");
        var user = await _userRepository.GetByIdWithRolesAsync(userId, cancellationToken)
            ?? throw new InvalidOperationException("User not found.");

        profile.Status = request.IsApproved ? AccountStatus.Approved : AccountStatus.Rejected;
        profile.AdminReviewNotes = request.Notes?.Trim();
        profile.ReviewedAtUtc = DateTime.UtcNow;
        user.Status = profile.Status;

        await _groupCreatorProfileRepository.SaveChangesAsync(cancellationToken);
    }
}
