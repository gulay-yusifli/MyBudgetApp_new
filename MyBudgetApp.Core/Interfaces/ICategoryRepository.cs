using MyBudgetApp.Core.Models;

namespace MyBudgetApp.Core.Interfaces;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(int id);
    Task<Category> AddAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> HasTransactionsAsync(int id);
    Task<bool> IsDuplicateNameAsync(string name, string? userId, int? excludeId = null);
}
