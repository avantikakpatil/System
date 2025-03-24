using System;
using System.ComponentModel.DataAnnotations;

namespace inventory_api.Models.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string BillingAddress { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string GSTNumber { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateUserDto
    {
        [Required]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string BillingAddress { get; set; } = string.Empty;

        [Required]
        public string ShippingAddress { get; set; } = string.Empty;

        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public string GSTNumber { get; set; } = string.Empty; // Optional
        public string CompanyName { get; set; } = string.Empty; // Optional

        public string Notes { get; set; } = string.Empty; // Optional
    }
}