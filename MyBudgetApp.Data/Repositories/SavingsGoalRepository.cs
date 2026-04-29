using Microsoft.EntityFrameworkCore;
using MyBudgetApp.Core.Interfaces;
using MyBudgetApp.Core.Models;

namespace MyBudgetApp.Data.Repositories;

public class SavingsGoalRepository : ISavingsGoalRepository
{
    private readonly BudgetDbContext _context;

    public SavingsGoalRepository(BudgetDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SavingsGoal>> GetAllByUserAsync(string userId) =>
        await _context.SavingsGoals
            .Where(g => g.UserId == userId)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();

    public async Task<SavingsGoal?> GetByIdAsync(int id) =>
        await _context.SavingsGoals.FindAsync(id);

    public async Task<SavingsGoal> AddAsync(SavingsGoal goal)
    {
        _context.SavingsGoals.Add(goal);
        await _context.SaveChangesAsync();
        return goal;
    }

    public async Task<SavingsGoal> UpdateAsync(SavingsGoal goal)
    {
        _context.SavingsGoals.Update(goal);
        await _context.SaveChangesAsync();
        return goal;
    }

    public async Task DeleteAsync(int id)
    {
        var goal = await _context.SavingsGoals.FindAsync(id);
        if (goal != null)
        {
            _context.SavingsGoals.Remove(goal);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id) =>
        await _context.SavingsGoals.AnyAsync(g => g.Id == id);
}
