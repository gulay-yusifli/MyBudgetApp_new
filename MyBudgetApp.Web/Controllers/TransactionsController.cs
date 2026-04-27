using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyBudgetApp.Core.DTOs;
using MyBudgetApp.Core.Interfaces;
using MyBudgetApp.Core.Models;
using System.Security.Claims;

namespace MyBudgetApp.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // ← ƏLAVƏ ET
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
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

            transaction.UserId = userId;  // ← User set et
            
            var created = await _transactionService.CreateAsync(transaction);
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
}
