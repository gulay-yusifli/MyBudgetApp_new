using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyBudgetApp.Core.DTOs;
using MyBudgetApp.Core.Interfaces;
using MyBudgetApp.Core.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Security.Claims;

namespace MyBudgetApp.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // ← ƏLAVƏ ET
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly IEmailService _emailService;
    private readonly Microsoft.AspNetCore.Identity.UserManager<ApplicationUser> _userManager;

    public TransactionsController(
        ITransactionService transactionService,
        IEmailService emailService,
        Microsoft.AspNetCore.Identity.UserManager<ApplicationUser> userManager)
    {
        _transactionService = transactionService;
        _emailService = emailService;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] TransactionFilterDto? filter)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token");

            filter ??= new TransactionFilterDto();
            var transactions = await _transactionService.GetFilteredAsync(filter);
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching transactions", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token");

            var transaction = await _transactionService.GetByIdAsync(id);
            if (transaction == null)
                return NotFound();
            return Ok(transaction);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching transaction", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Transaction transaction)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token");

            transaction.UserId = userId;
            
            var created = await _transactionService.CreateAsync(transaction);

            // Send email notification (fire-and-forget – don't block response)
            _ = Task.Run(async () =>
            {
                try
                {
                    var user = await _userManager.FindByIdAsync(userId);
                    if (user?.Email != null)
                    {
                        await _emailService.SendTransactionCreatedEmailAsync(
                            user.Email,
                            user.FullName,
                            transaction.Description ?? "N/A",
                            transaction.Amount,
                            transaction.Type.ToString());
                    }
                }
                catch { /* Swallow email errors so they don't affect the main flow */ }
            });

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating transaction", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Transaction transaction)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token");

            if (id != transaction.Id)
                return BadRequest("ID mismatch");

            transaction.UserId = userId;  // ← User set et

            await _transactionService.UpdateAsync(transaction);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating transaction", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token");

            var deleted = await _transactionService.DeleteAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting transaction", error = ex.Message });
        }
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token");

            var income = await _transactionService.GetTotalIncomeAsync(startDate, endDate);
            var expenses = await _transactionService.GetTotalExpensesAsync(startDate, endDate);
            var balance = await _transactionService.GetBalanceAsync(startDate, endDate);
            return Ok(new { income, expenses, balance });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching summary", error = ex.Message });
        }
    }

    [HttpGet("export/pdf")]
    public async Task<IActionResult> ExportPdf([FromQuery] TransactionFilterDto? filter)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token");

            filter ??= new TransactionFilterDto();
            var transactions = (await _transactionService.GetFilteredAsync(filter)).ToList();

            QuestPDF.Settings.License = LicenseType.Community;

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header().Column(col =>
                    {
                        col.Item().Text("MyBudgetApp — Transaction Report")
                            .FontSize(18).Bold().FontColor(Colors.Blue.Darken3);
                        col.Item().Text($"Generated: {DateTime.Now:dd MMM yyyy HH:mm}")
                            .FontSize(9).FontColor(Colors.Grey.Medium);
                        col.Item().PaddingTop(4).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    page.Content().PaddingTop(10).Column(col =>
                    {
                        // Summary row
                        var income = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
                        var expenses = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);
                        var balance = income - expenses;

                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Background(Colors.Green.Lighten4).Padding(8).Column(c =>
                            {
                                c.Item().Text("Total Income").FontSize(9).FontColor(Colors.Grey.Medium);
                                c.Item().Text($"+{income:F2} AZN").Bold().FontColor(Colors.Green.Darken2);
                            });
                            row.ConstantItem(8);
                            row.RelativeItem().Background(Colors.Red.Lighten4).Padding(8).Column(c =>
                            {
                                c.Item().Text("Total Expenses").FontSize(9).FontColor(Colors.Grey.Medium);
                                c.Item().Text($"-{expenses:F2} AZN").Bold().FontColor(Colors.Red.Darken2);
                            });
                            row.ConstantItem(8);
                            row.RelativeItem().Background(Colors.Blue.Lighten4).Padding(8).Column(c =>
                            {
                                c.Item().Text("Balance").FontSize(9).FontColor(Colors.Grey.Medium);
                                c.Item().Text($"{balance:F2} AZN").Bold()
                                    .FontColor(balance >= 0 ? Colors.Blue.Darken2 : Colors.Red.Darken2);
                            });
                        });

                        col.Item().PaddingTop(12).Table(table =>
                        {
                            table.ColumnsDefinition(cols =>
                            {
                                cols.ConstantColumn(70);   // Date
                                cols.ConstantColumn(55);   // Type
                                cols.RelativeColumn(2);    // Category
                                cols.RelativeColumn(3);    // Description
                                cols.ConstantColumn(80);   // Amount
                            });

                            // Header
                            table.Header(header =>
                            {
                                void HeaderCell(string text) =>
                                    header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                                        .Text(text).FontSize(9).Bold().FontColor(Colors.White);

                                HeaderCell("Date");
                                HeaderCell("Type");
                                HeaderCell("Category");
                                HeaderCell("Description");
                                HeaderCell("Amount");
                            });

                            // Rows
                            var rowIndex = 0;
                            foreach (var t in transactions)
                            {
                                var bg = rowIndex++ % 2 == 0 ? Colors.White : Colors.Grey.Lighten5;
                                var amountColor = t.Type == TransactionType.Income ? Colors.Green.Darken2 : Colors.Red.Darken2;
                                var sign = t.Type == TransactionType.Income ? "+" : "-";

                                table.Cell().Background(bg).Padding(5).Text(t.Date.ToString("dd/MM/yyyy")).FontSize(9);
                                table.Cell().Background(bg).Padding(5).Text(t.Type.ToString()).FontSize(9)
                                    .FontColor(amountColor);
                                table.Cell().Background(bg).Padding(5).Text(t.Category?.Name ?? "—").FontSize(9);
                                table.Cell().Background(bg).Padding(5).Text(t.Description ?? "—").FontSize(9);
                                table.Cell().Background(bg).Padding(5).Text($"{sign}{t.Amount:F2}").FontSize(9)
                                    .Bold().FontColor(amountColor);
                            }
                        });
                    });

                    page.Footer().AlignRight().Text(txt =>
                    {
                        txt.Span("Page ").FontSize(8).FontColor(Colors.Grey.Medium);
                        txt.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                        txt.Span(" of ").FontSize(8).FontColor(Colors.Grey.Medium);
                        txt.TotalPages().FontSize(8).FontColor(Colors.Grey.Medium);
                    });
                });
            }).GeneratePdf();

            return File(pdf, "application/pdf", $"transactions_{DateTime.Now:yyyyMMdd_HHmmss}.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error generating PDF", error = ex.Message });
        }
    }
}
