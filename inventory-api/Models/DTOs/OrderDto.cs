namespace inventory_api.Models.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; }
        public string? Notes { get; set; }
        public string ShippingAddress { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string OrderStatus { get; set; }
        public List<OrderItemDto> OrderItems { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; }
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class CreateOrderDto
    {
        public int CustomerId { get; set; }
        public string? Notes { get; set; }
        public List<CreateOrderItemDto> OrderItems { get; set; }
    }

    public class CreateOrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}