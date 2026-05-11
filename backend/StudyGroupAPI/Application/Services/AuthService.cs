using StudyGroupAPI.Application.DTOs.Auth;
using StudyGroupAPI.Application.Interfaces.Repositories;
using StudyGroupAPI.Application.Interfaces.Security;
using StudyGroupAPI.Application.Interfaces.Services;
using StudyGroupAPI.Domain.Entities;
using StudyGroupAPI.Domain.Enums;

namespace StudyGroupAPI.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IGroupCreatorProfileRepository _groupCreatorProfileRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IGroupCreatorProfileRepository groupCreatorProfileRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _groupCreatorProfileRepository = groupCreatorProfileRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task RegisterStudentAsync(RegisterStudentRequestDto request, CancellationToken cancellationToken)
    {
        await RegisterAsync(request.FullName, request.Email, request.Password, "Student", isPending: false, cancellationToken);
    }

    public async Task RegisterGroupCreatorAsync(RegisterGroupCreatorRequestDto request, CancellationToken cancellationToken)
    {
        await RegisterAsync(request.FullName, request.Email, request.Password, "GroupCreator", isPending: true, cancellationToken);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailWithRolesAsync(email, cancellationToken);
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        var isGroupCreator = user.UserRoles.Any(x => x.Role.Name == "GroupCreator");
        if (isGroupCreator && user.GroupCreatorProfile?.Status != AccountStatus.Approved)
        {
            throw new InvalidOperationException("Group creator account is not approved yet.");
        }

        if (user.Status == AccountStatus.Rejected)
        {
            throw new InvalidOperationException("Account has been rejected.");
        }

        return _tokenService.CreateToken(user);
    }

    private async Task RegisterAsync(
        string fullName,
        string email,
        string password,
        string roleName,
        bool isPending,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        if (await _userRepository.ExistsByEmailAsync(normalizedEmail, cancellationToken))
        {
            throw new InvalidOperationException("Email already registered.");
        }

        var role = await _roleRepository.GetByNameAsync(roleName, cancellationToken)
            ?? throw new InvalidOperationException($"Role '{roleName}' not found.");

        var user = new User
        {
            FullName = fullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.Hash(password),
            Status = isPending ? AccountStatus.Pending : AccountStatus.Approved
        };

        user.UserRoles.Add(new UserRole { User = user, Role = role });
        await _userRepository.AddAsync(user, cancellationToken);

        if (isPending)
        {
            var profile = new GroupCreatorProfile
            {
                User = user,
                Status = AccountStatus.Pending
            };
            await _groupCreatorProfileRepository.AddAsync(profile, cancellationToken);
        }

        await _userRepository.SaveChangesAsync(cancellationToken);
    }
}
