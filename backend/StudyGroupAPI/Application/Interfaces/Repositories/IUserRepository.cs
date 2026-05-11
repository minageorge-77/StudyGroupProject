using StudyGroupAPI.Domain.Entities;

namespace StudyGroupAPI.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken);
    Task AddAsync(User user, CancellationToken cancellationToken);
    Task<User?> GetByEmailWithRolesAsync(string email, CancellationToken cancellationToken);
    Task<User?> GetByIdWithRolesAsync(Guid userId, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
