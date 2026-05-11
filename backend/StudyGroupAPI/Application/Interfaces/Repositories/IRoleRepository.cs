using StudyGroupAPI.Domain.Entities;

namespace StudyGroupAPI.Application.Interfaces.Repositories;

public interface IRoleRepository
{
    Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<Role>> GetDefaultRolesAsync(CancellationToken cancellationToken);
}
