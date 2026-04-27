using System.ComponentModel.DataAnnotations;

namespace MyBudgetApp.Core.Models;

public class Transaction
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Amount is required.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Date is required.")]
    public DateTime Date { get; set; } = DateTime.Today;

    [Required(ErrorMessage = "Transaction type is required.")]
    public TransactionType Type { get; set; }

    [Required(ErrorMessage = "Category is required.")]
    public int CategoryId { get; set; }

    public Category? Category { get; set; }

    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    public string? Description { get; set; }

    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
}
