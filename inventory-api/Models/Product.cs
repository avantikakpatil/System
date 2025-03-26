using System;
using System.ComponentModel.DataAnnotations;

namespace inventory_api.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string ProductCode { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        [Required]
        public decimal Weight { get; set; }

        [Required]
        public decimal Volume { get; set; }

        [Required]
        public int StockQuantity { get; set; }

        [Required]
        public int MinimumOrderQuantity { get; set; }

        [Required]
        [StringLength(100)]
        public string SupplierName { get; set; } = string.Empty;

        [StringLength(255)]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}