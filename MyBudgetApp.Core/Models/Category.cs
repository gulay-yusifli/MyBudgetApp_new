using System.ComponentModel.DataAnnotations;

namespace MyBudgetApp.Core.Models;

public class Category
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Category name is required.")]
    [StringLength(100, ErrorMessage = "Category name cannot exceed 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(7, ErrorMessage = "Color must be a valid hex color code (e.g. #FF5733).")]
    public string Color { get; set; } = "#6c757d";

    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
}
