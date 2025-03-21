// Models/Product.cs
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
        public string Name { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Description { get; set; }
        
        [Required]
        public decimal Price { get; set; }
        
        [Required]
        public int StockQuantity { get; set; }
        
        [StringLength(100)]
        public string Category { get; set; }
        
        [StringLength(255)]
        public string ImageUrl { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
    }
}