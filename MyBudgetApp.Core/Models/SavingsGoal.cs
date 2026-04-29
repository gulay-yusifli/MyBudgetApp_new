using System.ComponentModel.DataAnnotations;

namespace MyBudgetApp.Core.Models;

public class SavingsGoal
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Goal name is required.")]
    [StringLength(200, ErrorMessage = "Goal name cannot exceed 200 characters.")]
    public string GoalName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Target amount is required.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Target amount must be greater than zero.")]
    public decimal TargetAmount { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Current amount cannot be negative.")]
    public decimal CurrentAmount { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Monthly budget must be greater than zero.")]
    public decimal MonthlyBudget { get; set; }

    public DateTime? TargetDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
}
