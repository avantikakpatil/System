using System;
using System.ComponentModel.DataAnnotations;

namespace inventory_api.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string BillingAddress { get; set; } = string.Empty;

        [Required]
        public string ShippingAddress { get; set; } = string.Empty;

        public double Latitude { get; set; } // Auto-filled or manually entered
        public double Longitude { get; set; } // Auto-filled or manually entered

        public string GSTNumber { get; set; } = string.Empty; // Optional
        public string CompanyName { get; set; } = string.Empty; // Optional

        public string Notes { get; set; } = string.Empty; // Optional

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}