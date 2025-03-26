namespace inventory_api.Models.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal Weight { get; set; }
        public decimal Volume { get; set; }
        public int StockQuantity { get; set; }
        public int MinimumOrderQuantity { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}