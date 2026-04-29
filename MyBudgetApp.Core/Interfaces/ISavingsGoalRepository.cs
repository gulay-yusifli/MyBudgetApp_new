using MyBudgetApp.Core.Models;

namespace MyBudgetApp.Core.Interfaces;

public interface ISavingsGoalRepository
{
    Task<IEnumerable<SavingsGoal>> GetAllByUserAsync(string userId);
    Task<SavingsGoal?> GetByIdAsync(int id);
    Task<SavingsGoal> AddAsync(SavingsGoal goal);
    Task<SavingsGoal> UpdateAsync(SavingsGoal goal);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
