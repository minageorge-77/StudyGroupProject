using StudyGroupAPI.Application.DTOs.Auth;

namespace StudyGroupAPI.Application.Interfaces.Services;

public interface IAuthService
{
    Task RegisterStudentAsync(RegisterStudentRequestDto request, CancellationToken cancellationToken);
    Task RegisterGroupCreatorAsync(RegisterGroupCreatorRequestDto request, CancellationToken cancellationToken);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken);
}
