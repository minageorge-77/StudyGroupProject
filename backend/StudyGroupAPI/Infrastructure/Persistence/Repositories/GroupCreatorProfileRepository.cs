using Microsoft.EntityFrameworkCore;
using StudyGroupAPI.Application.Interfaces.Repositories;
using StudyGroupAPI.Domain.Entities;
using StudyGroupAPI.Domain.Enums;

namespace StudyGroupAPI.Infrastructure.Persistence.Repositories;

public class GroupCreatorProfileRepository : IGroupCreatorProfileRepository
{
    private readonly StudyGroupDbContext _dbContext;

    public GroupCreatorProfileRepository(StudyGroupDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(GroupCreatorProfile profile, CancellationToken cancellationToken)
    {
        await _dbContext.GroupCreatorProfiles.AddAsync(profile, cancellationToken);
    }

    public Task<GroupCreatorProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return _dbContext.GroupCreatorProfiles.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<GroupCreatorProfile>> GetPendingAsync(CancellationToken cancellationToken)
    {
        var profiles = await _dbContext.GroupCreatorProfiles
            .Where(x => x.Status == AccountStatus.Pending)
            .Include(x => x.User)
            .OrderBy(x => x.RequestedAtUtc)
            .ToListAsync(cancellationToken);

        return profiles;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }
}
