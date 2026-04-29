using MyBudgetApp.Core.Models;

namespace MyBudgetApp.Core.Interfaces;

public interface ISavingsGoalService
{
    Task<IEnumerable<SavingsGoal>> GetAllByUserAsync(string userId);
    Task<SavingsGoal?> GetByIdAsync(int id);
    Task<SavingsGoal> CreateAsync(SavingsGoal goal);
    Task<SavingsGoal> UpdateAsync(SavingsGoal goal);
    Task<bool> DeleteAsync(int id);
    Task<SavingsGoal> ContributeAsync(int id, decimal amount);
}
