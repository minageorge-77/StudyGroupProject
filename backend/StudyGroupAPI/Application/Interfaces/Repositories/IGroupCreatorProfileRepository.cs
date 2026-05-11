using StudyGroupAPI.Domain.Entities;

namespace StudyGroupAPI.Application.Interfaces.Repositories;

public interface IGroupCreatorProfileRepository
{
    Task AddAsync(GroupCreatorProfile profile, CancellationToken cancellationToken);
    Task<GroupCreatorProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<GroupCreatorProfile>> GetPendingAsync(CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
