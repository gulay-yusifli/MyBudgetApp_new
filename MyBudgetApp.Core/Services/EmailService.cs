using MyBudgetApp.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace MyBudgetApp.Core.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private async Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
        var smtpPort = int.TryParse(_configuration["Email:SmtpPort"], out var port) ? port : 587;
        var smtpUser = _configuration["Email:SmtpUser"] ?? string.Empty;
        var smtpPassword = _configuration["Email:SmtpPassword"] ?? string.Empty;
        var fromEmail = _configuration["Email:FromEmail"] ?? smtpUser;
        var fromName = _configuration["Email:FromName"] ?? "MyBudgetApp";

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUser, smtpPassword),
            EnableSsl = true
        };

        using var message = new MailMessage
        {
            From = new MailAddress(fromEmail, fromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(toEmail);

        await client.SendMailAsync(message);
    }

    public Task SendRegistrationEmailAsync(string toEmail, string fullName)
    {
        var subject = "Welcome to MyBudgetApp! 🎉";
        var body = $"""
            <html>
            <body style="font-family:Arial,sans-serif;background:#f4f6f9;padding:20px;">
              <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                <h1 style="color:#1e3a8a;">Welcome to MyBudgetApp, {WebUtility.HtmlEncode(fullName)}! 🎉</h1>
                <p style="color:#374151;font-size:16px;">Your account has been created successfully.</p>
                <p style="color:#374151;">Start tracking your finances, set savings goals, and take control of your budget today.</p>
                <a href="#" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1e3a8a;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Get Started</a>
                <p style="margin-top:24px;color:#9ca3af;font-size:12px;">MyBudgetApp — Your personal finance companion.</p>
              </div>
            </body>
            </html>
            """;
        return SendAsync(toEmail, subject, body);
    }

    public Task SendTransactionCreatedEmailAsync(string toEmail, string fullName, string description, decimal amount, string type)
    {
        var color = type.Equals("Income", StringComparison.OrdinalIgnoreCase) ? "#16a34a" : "#dc2626";
        var sign = type.Equals("Income", StringComparison.OrdinalIgnoreCase) ? "+" : "-";
        var subject = $"Transaction recorded: {sign}{amount:F2} AZN";
        var body = $"""
            <html>
            <body style="font-family:Arial,sans-serif;background:#f4f6f9;padding:20px;">
              <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                <h2 style="color:#1e3a8a;">Transaction Recorded</h2>
                <p style="color:#374151;">Hi <strong>{WebUtility.HtmlEncode(fullName)}</strong>, a new transaction has been recorded.</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                  <tr><td style="padding:8px;color:#6b7280;">Description</td><td style="padding:8px;font-weight:bold;">{WebUtility.HtmlEncode(description)}</td></tr>
                  <tr style="background:#f9fafb;"><td style="padding:8px;color:#6b7280;">Type</td><td style="padding:8px;font-weight:bold;color:{color};">{WebUtility.HtmlEncode(type)}</td></tr>
                  <tr><td style="padding:8px;color:#6b7280;">Amount</td><td style="padding:8px;font-weight:bold;font-size:18px;color:{color};">{sign}{amount:F2} AZN</td></tr>
                </table>
                <p style="margin-top:24px;color:#9ca3af;font-size:12px;">MyBudgetApp — Your personal finance companion.</p>
              </div>
            </body>
            </html>
            """;
        return SendAsync(toEmail, subject, body);
    }

    public Task SendMonthlySavingsReminderAsync(string toEmail, string fullName, string goalName, decimal targetAmount, decimal currentAmount, decimal monthlyBudget)
    {
        var progress = targetAmount > 0 ? (int)Math.Round(currentAmount / targetAmount * 100) : 0;
        var remaining = targetAmount - currentAmount;
        var subject = $"Monthly Savings Reminder: {goalName}";
        var body = $"""
            <html>
            <body style="font-family:Arial,sans-serif;background:#f4f6f9;padding:20px;">
              <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                <h2 style="color:#1e3a8a;">Monthly Savings Reminder 💰</h2>
                <p style="color:#374151;">Hi <strong>{WebUtility.HtmlEncode(fullName)}</strong>, here is your monthly savings update for <strong>{WebUtility.HtmlEncode(goalName)}</strong>.</p>
                <div style="margin:20px 0;background:#f0f9ff;border-radius:8px;padding:16px;">
                  <p style="margin:0;color:#374151;">Progress: <strong>{progress}%</strong></p>
                  <div style="background:#e5e7eb;border-radius:4px;height:12px;margin-top:8px;">
                    <div style="background:#1e3a8a;border-radius:4px;height:12px;width:{Math.Min(progress, 100)}%;"></div>
                  </div>
                </div>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:8px;color:#6b7280;">Target Amount</td><td style="padding:8px;font-weight:bold;">{targetAmount:F2} AZN</td></tr>
                  <tr style="background:#f9fafb;"><td style="padding:8px;color:#6b7280;">Saved So Far</td><td style="padding:8px;font-weight:bold;color:#16a34a;">{currentAmount:F2} AZN</td></tr>
                  <tr><td style="padding:8px;color:#6b7280;">Remaining</td><td style="padding:8px;font-weight:bold;color:#dc2626;">{remaining:F2} AZN</td></tr>
                  <tr style="background:#f9fafb;"><td style="padding:8px;color:#6b7280;">Monthly Budget</td><td style="padding:8px;font-weight:bold;">{monthlyBudget:F2} AZN</td></tr>
                </table>
                <p style="margin-top:16px;color:#374151;">Keep it up! You're making great progress toward your goal.</p>
                <p style="margin-top:24px;color:#9ca3af;font-size:12px;">MyBudgetApp — Your personal finance companion.</p>
              </div>
            </body>
            </html>
            """;
        return SendAsync(toEmail, subject, body);
    }
}
