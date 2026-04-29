namespace MyBudgetApp.Core.DTOs;

public class TransactionFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? CategoryId { get; set; }
    public string? Type { get; set; }
    /// <summary>
    /// Optional preset: "LastMonth" or "Last6Months". Overrides StartDate/EndDate when set.
    /// </summary>
    public string? DateRangePreset { get; set; }
}
