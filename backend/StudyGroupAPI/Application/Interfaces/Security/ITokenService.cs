using StudyGroupAPI.Application.DTOs.Auth;
using StudyGroupAPI.Domain.Entities;

namespace StudyGroupAPI.Application.Interfaces.Security;

public interface ITokenService
{
    AuthResponseDto CreateToken(User user);
}
