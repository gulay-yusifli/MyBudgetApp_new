using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MyBudgetApp.Core.Models;

namespace MyBudgetApp.Data;

public class BudgetDbContext : IdentityDbContext<ApplicationUser>
{
    public BudgetDbContext(DbContextOptions<BudgetDbContext> options) : base(options)
    {
    }

    public DbSet<Transaction> Transactions { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<SavingsGoal> SavingsGoals { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Color).HasMaxLength(7).HasDefaultValue("#6c757d");
        });

        modelBuilder.Entity<SavingsGoal>(entity =>
        {
            entity.HasKey(g => g.Id);
            entity.Property(g => g.GoalName).IsRequired().HasMaxLength(200);
            entity.Property(g => g.TargetAmount).HasPrecision(18, 2).IsRequired();
            entity.Property(g => g.CurrentAmount).HasPrecision(18, 2).HasDefaultValue(0m);
            entity.Property(g => g.MonthlyBudget).HasPrecision(18, 2).IsRequired();

            entity.HasOne(g => g.User)
                  .WithMany(u => u.SavingsGoals)
                  .HasForeignKey(g => g.UserId)
                  .OnDelete(DeleteBehavior.Cascade)
                  .IsRequired(false);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Amount).HasPrecision(18, 2).IsRequired();
            entity.Property(t => t.Date).IsRequired();
            entity.Property(t => t.Type).IsRequired();
            entity.Property(t => t.Description).HasMaxLength(500);

            entity.HasOne(t => t.Category)
                  .WithMany(c => c.Transactions)
                  .HasForeignKey(t => t.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.User)
                  .WithMany(u => u.Transactions)
                  .HasForeignKey(t => t.UserId)
                  .OnDelete(DeleteBehavior.Cascade)
                  .IsRequired(false);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasOne(c => c.User)
                  .WithMany(u => u.Categories)
                  .HasForeignKey(c => c.UserId)
                  .OnDelete(DeleteBehavior.Cascade)
                  .IsRequired(false);
        });

        // Seed default categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Salary", Color = "#28a745" },
            new Category { Id = 2, Name = "Food & Dining", Color = "#fd7e14" },
            new Category { Id = 3, Name = "Transport", Color = "#17a2b8" },
            new Category { Id = 4, Name = "Rent & Housing", Color = "#6610f2" },
            new Category { Id = 5, Name = "Healthcare", Color = "#dc3545" },
            new Category { Id = 6, Name = "Entertainment", Color = "#e83e8c" },
            new Category { Id = 7, Name = "Education", Color = "#007bff" },
            new Category { Id = 8, Name = "Shopping", Color = "#ffc107" },
            new Category { Id = 9, Name = "Utilities", Color = "#6c757d" },
            new Category { Id = 10, Name = "Other", Color = "#343a40" }
        );
    }
}
