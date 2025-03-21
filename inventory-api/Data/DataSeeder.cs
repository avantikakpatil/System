// Data/DataSeeder.cs
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using inventory_api.Models;

namespace inventory_api.Data
{
    public static class DataSeeder
    {
        public static void SeedData(IHost host)
        {
            using var scope = host.Services.CreateScope();
            var services = scope.ServiceProvider;
            var context = services.GetRequiredService<ApplicationDbContext>();

            try
            {
                // Check if we have any users
                if (!context.Users.Any())
                {
                    // Add admin user
                    context.Users.Add(new User
                    {
                        Name = "Admin User",
                        Email = "admin@example.com",
                        PasswordHash = HashPassword("admin123"),
                        Role = "Admin",
                        CreatedAt = DateTime.UtcNow
                    });

                    // Add regular user
                    context.Users.Add(new User
                    {
                        Name = "Regular User",
                        Email = "user@example.com",
                        PasswordHash = HashPassword("user123"),
                        Role = "User",
                        CreatedAt = DateTime.UtcNow
                    });

                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"An error occurred while seeding the database: {ex.Message}");
            }
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
        }
    }
}