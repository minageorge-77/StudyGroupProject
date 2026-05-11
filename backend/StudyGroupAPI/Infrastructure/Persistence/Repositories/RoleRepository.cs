using Microsoft.EntityFrameworkCore;
using StudyGroupAPI.Application.Interfaces.Repositories;
using StudyGroupAPI.Domain.Entities;

namespace StudyGroupAPI.Infrastructure.Persistence.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly StudyGroupDbContext _dbContext;

    public RoleRepository(StudyGroupDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken)
    {
        return _dbContext.Roles.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Role>> GetDefaultRolesAsync(CancellationToken cancellationToken)
    {
        var roles = await _dbContext.Roles.ToListAsync(cancellationToken);
        return roles;
    }
}
