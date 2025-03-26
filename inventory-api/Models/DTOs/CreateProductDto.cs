using System.ComponentModel.DataAnnotations;

namespace inventory_api.Models.DTOs
{
    public class CreateProductDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Product Code is required")]
        [StringLength(50, ErrorMessage = "Product Code cannot exceed 50 characters")]
        public string ProductCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required")]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category is required")]
        [StringLength(100, ErrorMessage = "Category cannot exceed 100 characters")]
        public string Category { get; set; } = string.Empty;

        [Required(ErrorMessage = "Price is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Weight is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Weight must be a positive number")]
        public decimal Weight { get; set; }

        [Required(ErrorMessage = "Volume is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Volume must be a positive number")]
        public decimal Volume { get; set; }

        [Required(ErrorMessage = "Stock quantity is required")]
        [Range(0, int.MaxValue, ErrorMessage = "Stock quantity must be a positive number")]
        public int StockQuantity { get; set; }

        [Required(ErrorMessage = "Minimum Order Quantity is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Minimum Order Quantity must be at least 1")]
        public int MinimumOrderQuantity { get; set; }

        [Required(ErrorMessage = "Supplier Name is required")]
        [StringLength(100, ErrorMessage = "Supplier Name cannot exceed 100 characters")]
        public string SupplierName { get; set; } = string.Empty;

        [Url(ErrorMessage = "Image URL must be a valid URL")]
        [StringLength(255, ErrorMessage = "Image URL cannot exceed 255 characters")]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}