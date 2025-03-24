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
            var context = services.GetRequiredService<ApplicationDbContext>(); // Make sure this matches your actual DbContext type

            try
            {
                // Check if we have any users
                if (!context.Users.Any())
                {
                    // Add admin user
                    context.Users.Add(new User
                    {
                        CustomerName = "Admin User",
                        Email = "admin@example.com",
                        PhoneNumber = "1234567890",
                        BillingAddress = "123 Admin St, City, Country",
                        ShippingAddress = "123 Admin St, City, Country",
                        Latitude = 0.0,
                        Longitude = 0.0,
                        GSTNumber = "ADMIN123GST",
                        CompanyName = "Admin Company",
                        Notes = "Admin user created during seeding",
                        CreatedAt = DateTime.UtcNow
                    });

                    // Add regular user
                    context.Users.Add(new User
                    {
                        CustomerName = "Regular User",
                        Email = "user@example.com",
                        PhoneNumber = "9876543210",
                        BillingAddress = "456 User St, City, Country",
                        ShippingAddress = "456 User St, City, Country",
                        Latitude = 0.0,
                        Longitude = 0.0,
                        GSTNumber = "USER456GST",
                        CompanyName = "User Company",
                        Notes = "Regular user created during seeding",
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

        // Since you don't have PasswordHash in your model, you might not need this method anymore
        // If you do need to store passwords, you'll need to add that field to your User model
        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
        }
    }
}