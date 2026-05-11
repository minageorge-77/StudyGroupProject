using Microsoft.EntityFrameworkCore;
using StudyGroupAPI.Domain.Entities;
using StudyGroupAPI.Domain.Enums;

namespace StudyGroupAPI.Infrastructure.Persistence;

public class StudyGroupDbContext : DbContext
{
    public StudyGroupDbContext(DbContextOptions<StudyGroupDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<GroupCreatorProfile> GroupCreatorProfiles => Set<GroupCreatorProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Email).HasMaxLength(255);
            entity.Property(x => x.FullName).HasMaxLength(150);
            entity.Property(x => x.PasswordHash).HasMaxLength(500);
            entity.Property(x => x.Status).HasConversion<int>();
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Name).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(x => new { x.UserId, x.RoleId });
            entity.HasOne(x => x.User).WithMany(x => x.UserRoles).HasForeignKey(x => x.UserId);
            entity.HasOne(x => x.Role).WithMany(x => x.UserRoles).HasForeignKey(x => x.RoleId);
        });

        modelBuilder.Entity<GroupCreatorProfile>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.UserId).IsUnique();
            entity.Property(x => x.Status).HasConversion<int>();
            entity.Property(x => x.AdminReviewNotes).HasMaxLength(500);
            entity.HasOne(x => x.User)
                .WithOne(x => x.GroupCreatorProfile)
                .HasForeignKey<GroupCreatorProfile>(x => x.UserId);
        });

        SeedRoles(modelBuilder);
    }

    private static void SeedRoles(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = Guid.Parse("6a2d9d80-3c5e-4f27-9f6a-11b68f8e0b31"), Name = "Admin" },
            new Role { Id = Guid.Parse("ec8f5ba9-aa9d-4af2-9ed4-4f51cd08b452"), Name = "GroupCreator" },
            new Role { Id = Guid.Parse("f7796043-2cc8-47a1-aeba-ddf3c5fe1d77"), Name = "Student" }
        );
    }
}
