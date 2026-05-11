using Microsoft.EntityFrameworkCore;
using StudyGroupAPI.Application.Interfaces.Repositories;
using StudyGroupAPI.Domain.Entities;

namespace StudyGroupAPI.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly StudyGroupDbContext _dbContext;

    public UserRepository(StudyGroupDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken)
    {
        return _dbContext.Users.AnyAsync(x => x.Email == email, cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken)
    {
        await _dbContext.Users.AddAsync(user, cancellationToken);
    }

    public Task<User?> GetByEmailWithRolesAsync(string email, CancellationToken cancellationToken)
    {
        return _dbContext.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .Include(x => x.GroupCreatorProfile)
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
    }

    public Task<User?> GetByIdWithRolesAsync(Guid userId, CancellationToken cancellationToken)
    {
        return _dbContext.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .Include(x => x.GroupCreatorProfile)
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }
}
