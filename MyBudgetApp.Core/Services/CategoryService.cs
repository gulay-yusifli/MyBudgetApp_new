using MyBudgetApp.Core.Interfaces;
using MyBudgetApp.Core.Models;

namespace MyBudgetApp.Core.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<Category>> GetAllAsync() =>
        _repository.GetAllAsync();

    public Task<Category?> GetByIdAsync(int id) =>
        _repository.GetByIdAsync(id);

    public async Task<Category> CreateAsync(Category category)
    {
        ArgumentNullException.ThrowIfNull(category);

        if (string.IsNullOrWhiteSpace(category.Name))
            throw new ArgumentException("Category name cannot be empty.", nameof(category));

        if (await _repository.IsDuplicateNameAsync(category.Name, category.UserId))
            throw new InvalidOperationException($"A category named '{category.Name}' already exists.");

        return await _repository.AddAsync(category);
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        ArgumentNullException.ThrowIfNull(category);

        if (string.IsNullOrWhiteSpace(category.Name))
            throw new ArgumentException("Category name cannot be empty.", nameof(category));

        if (!await _repository.ExistsAsync(category.Id))
            throw new KeyNotFoundException($"Category with ID {category.Id} not found.");

        if (await _repository.IsDuplicateNameAsync(category.Name, category.UserId, excludeId: category.Id))
            throw new InvalidOperationException($"A category named '{category.Name}' already exists.");

        return await _repository.UpdateAsync(category);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id))
            return false;

        if (await _repository.HasTransactionsAsync(id))
            throw new InvalidOperationException("Cannot delete a category that has associated transactions.");

        await _repository.DeleteAsync(id);
        return true;
    }

    public Task<bool> ExistsAsync(int id) =>
        _repository.ExistsAsync(id);
}
