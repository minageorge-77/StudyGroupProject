using StudyGroupAPI.Domain.Enums;

namespace StudyGroupAPI.Domain.Entities;

public class GroupCreatorProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string? AdminReviewNotes { get; set; }
    public AccountStatus Status { get; set; } = AccountStatus.Pending;
    public DateTime RequestedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAtUtc { get; set; }
}
