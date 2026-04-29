using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyBudgetApp.Core.Interfaces;
using MyBudgetApp.Core.Models;
using System.Security.Claims;

namespace MyBudgetApp.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SavingsGoalsController : ControllerBase
{
    private readonly ISavingsGoalService _service;

    public SavingsGoalsController(ISavingsGoalService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token");

            var goals = await _service.GetAllByUserAsync(userId);
            return Ok(goals);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching savings goals", error = ex.Message });
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

            var goal = await _service.GetByIdAsync(id);
            if (goal == null || goal.UserId != userId)
                return NotFound();
            return Ok(goal);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching savings goal", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SavingsGoal goal)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token");

            goal.UserId = userId;
            var created = await _service.CreateAsync(goal);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating savings goal", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SavingsGoal goal)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token");

            if (id != goal.Id)
                return BadRequest("ID mismatch");

            goal.UserId = userId;
            await _service.UpdateAsync(goal);
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
            return StatusCode(500, new { message = "Error updating savings goal", error = ex.Message });
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

            var goal = await _service.GetByIdAsync(id);
            if (goal == null || goal.UserId != userId)
                return NotFound();

            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting savings goal", error = ex.Message });
        }
    }

    [HttpPost("{id}/contribute")]
    public async Task<IActionResult> Contribute(int id, [FromBody] ContributeRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token");

            var goal = await _service.GetByIdAsync(id);
            if (goal == null || goal.UserId != userId)
                return NotFound();

            var updated = await _service.ContributeAsync(id, request.Amount);
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error contributing to savings goal", error = ex.Message });
        }
    }
}

public record ContributeRequest(decimal Amount);
