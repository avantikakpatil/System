using System.ComponentModel.DataAnnotations;

namespace inventory_api.Models.DTOs
{
    public class UpdateProductDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? Price { get; set; }

        [Range(0, int.MaxValue)]
        public int? StockQuantity { get; set; }

        [StringLength(100)]
        public string? Category { get; set; }

        public string? ImageUrl { get; set; }
    }
}