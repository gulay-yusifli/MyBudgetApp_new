using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyBudgetApp.Core.Interfaces;

namespace MyBudgetApp.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var summary = await _dashboardService.GetSummaryAsync();
        return Ok(summary);
    }

    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthlySummaries([FromQuery] int months = 12)
    {
        var summaries = await _dashboardService.GetMonthlySummariesAsync(months);
        return Ok(summaries);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategorySummaries()
    {
        var summaries = await _dashboardService.GetCategorySummariesAsync();
        return Ok(summaries);
    }
}
