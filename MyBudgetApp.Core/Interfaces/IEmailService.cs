namespace MyBudgetApp.Core.Interfaces;

public interface IEmailService
{
    Task SendRegistrationEmailAsync(string toEmail, string fullName);
    Task SendTransactionCreatedEmailAsync(string toEmail, string fullName, string description, decimal amount, string type);
    Task SendMonthlySavingsReminderAsync(string toEmail, string fullName, string goalName, decimal targetAmount, decimal currentAmount, decimal monthlyBudget);
}
