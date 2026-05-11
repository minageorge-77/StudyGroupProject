using StudyGroupAPI.Application.DTOs.Admin;

namespace StudyGroupAPI.Application.Interfaces.Services;

public interface IAdminService
{
    Task<IReadOnlyCollection<PendingGroupCreatorDto>> GetPendingGroupCreatorsAsync(CancellationToken cancellationToken);
    Task ReviewGroupCreatorAsync(Guid userId, CreatorDecisionRequestDto request, CancellationToken cancellationToken);
}
