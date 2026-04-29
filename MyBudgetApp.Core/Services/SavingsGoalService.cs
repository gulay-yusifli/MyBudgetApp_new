using MyBudgetApp.Core.Interfaces;
using MyBudgetApp.Core.Models;

namespace MyBudgetApp.Core.Services;

public class SavingsGoalService : ISavingsGoalService
{
    private readonly ISavingsGoalRepository _repository;

    public SavingsGoalService(ISavingsGoalRepository repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<SavingsGoal>> GetAllByUserAsync(string userId) =>
        _repository.GetAllByUserAsync(userId);

    public Task<SavingsGoal?> GetByIdAsync(int id) =>
        _repository.GetByIdAsync(id);

    public async Task<SavingsGoal> CreateAsync(SavingsGoal goal)
    {
        ArgumentNullException.ThrowIfNull(goal);

        if (string.IsNullOrWhiteSpace(goal.GoalName))
            throw new ArgumentException("Goal name cannot be empty.", nameof(goal));

        if (goal.TargetAmount <= 0)
            throw new ArgumentException("Target amount must be greater than zero.", nameof(goal));

        if (goal.MonthlyBudget <= 0)
            throw new ArgumentException("Monthly budget must be greater than zero.", nameof(goal));

        goal.CreatedAt = DateTime.UtcNow;
        goal.UpdatedAt = DateTime.UtcNow;

        return await _repository.AddAsync(goal);
    }

    public async Task<SavingsGoal> UpdateAsync(SavingsGoal goal)
    {
        ArgumentNullException.ThrowIfNull(goal);

        if (string.IsNullOrWhiteSpace(goal.GoalName))
            throw new ArgumentException("Goal name cannot be empty.", nameof(goal));

        if (goal.TargetAmount <= 0)
            throw new ArgumentException("Target amount must be greater than zero.", nameof(goal));

        if (!await _repository.ExistsAsync(goal.Id))
            throw new KeyNotFoundException($"Savings goal with ID {goal.Id} not found.");

        goal.UpdatedAt = DateTime.UtcNow;

        return await _repository.UpdateAsync(goal);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id))
            return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<SavingsGoal> ContributeAsync(int id, decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Contribution amount must be greater than zero.", nameof(amount));

        var goal = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Savings goal with ID {id} not found.");

        goal.CurrentAmount += amount;
        goal.UpdatedAt = DateTime.UtcNow;

        return await _repository.UpdateAsync(goal);
    }
}
