// Models/DTOs/CreateProductDto.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace inventory_api.Models.DTOs
{
    public class CreateProductDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Description { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        [JsonPropertyName("stockQuantity")]
        public int StockQuantity { get; set; }
        
        [StringLength(100)]
        public string Category { get; set; }
        
        [StringLength(255)]
        public string ImageUrl { get; set; }
        
        public bool IsActive { get; set; } = true;
    }
}