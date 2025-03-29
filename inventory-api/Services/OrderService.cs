using Microsoft.EntityFrameworkCore;
using inventory_api.Data;
using inventory_api.Models;
using inventory_api.Models.DTOs;

namespace inventory_api.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;

        public OrderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto orderDto)
        {
            // Validate customer
            var customer = await _context.Users.FindAsync(orderDto.CustomerId);
            if (customer == null)
                throw new ArgumentException("Invalid Customer");

            

            // Validate products and calculate total
            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in orderDto.OrderItems)
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.Id == item.ProductId && p.IsActive && p.StockQuantity >= item.Quantity);

                if (product == null)
                    throw new ArgumentException($"Product {item.ProductId} is not available or insufficient stock");

                // Reduce stock
                product.StockQuantity -= item.Quantity;

                var orderItem = new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = product.Price * item.Quantity
                };

                totalAmount += orderItem.TotalPrice;
                orderItems.Add(orderItem);
            }

            

            // Validate warehouse if provided
    Warehouse warehouse = null;
    if (orderDto.WarehouseId.HasValue)
    {
        warehouse = await _context.Warehouses.FindAsync(orderDto.WarehouseId.Value);
        if (warehouse == null)
            throw new ArgumentException("Invalid Warehouse");
    }
    
    var order = new Order
    {
        CustomerId = orderDto.CustomerId,
        WarehouseId = orderDto.WarehouseId, // Add warehouse ID
        TotalAmount = totalAmount,
        OrderDate = DateTime.UtcNow,
        Notes = orderDto.Notes,
        OrderItems = orderItems,
        OrderStatus = "Pending"
    };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Map to DTO
            return await GetOrderByIdAsync(order.Id);
        }

    public async Task<List<OrderDto>> GetAllOrdersAsync()
{
    return await _context.Orders
        .Include(o => o.Customer)
        .Include(o => o.Warehouse) // Include warehouse
        .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
        .Select(o => new OrderDto
        {
            Id = o.Id,
            CustomerId = o.CustomerId,
            CustomerName = o.Customer.CustomerName,
            TotalAmount = o.TotalAmount,
            OrderDate = o.OrderDate,
            Notes = o.Notes,
            OrderStatus = o.OrderStatus,
            ShippingAddress = o.Customer.ShippingAddress,
            Latitude = o.Customer.Latitude,
            Longitude = o.Customer.Longitude,
            WarehouseId = o.WarehouseId,
            WarehouseName = o.Warehouse != null ? o.Warehouse.Name : null,
            WarehouseAddress = o.Warehouse != null ? o.Warehouse.Address : null,
            WarehouseLatitude = o.Warehouse != null ? o.Warehouse.Latitude : 0,
            WarehouseLongitude = o.Warehouse != null ? o.Warehouse.Longitude : 0,
            OrderItems = o.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.Product.Name,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                TotalPrice = oi.TotalPrice
            }).ToList()
        })
        .ToListAsync();
}
public async Task<OrderDto> GetOrderByIdAsync(int orderId)
{
    var order = await _context.Orders
        .Include(o => o.Customer)
        .Include(o => o.Warehouse) // Include warehouse
        .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
        .FirstOrDefaultAsync(o => o.Id == orderId);

    if (order == null)
        throw new ArgumentException("Order not found");

    return new OrderDto
    {
        WarehouseId = order.WarehouseId,
        WarehouseName = order.Warehouse?.Name,
        WarehouseAddress = order.Warehouse?.Address,
        WarehouseLatitude = order.Warehouse?.Latitude ?? 0,
        WarehouseLongitude = order.Warehouse?.Longitude ?? 0,
        Id = order.Id,
        CustomerId = order.CustomerId,
        CustomerName = order.Customer.CustomerName,
        TotalAmount = order.TotalAmount,
        OrderDate = order.OrderDate,
        Notes = order.Notes,
        OrderStatus = order.OrderStatus,
        ShippingAddress = order.Customer.ShippingAddress, // Directly use ShippingAddress
        Latitude = order.Customer.Latitude, // Directly use Latitude
        Longitude = order.Customer.Longitude, // Directly use Longitude
        OrderItems = order.OrderItems.Select(oi => new OrderItemDto
        {
            Id = oi.Id,
            ProductId = oi.ProductId,
            ProductName = oi.Product.Name,
            Quantity = oi.Quantity,
            UnitPrice = oi.UnitPrice,
            TotalPrice = oi.TotalPrice
        }).ToList()
    };
}

        public async Task<OrderDto> UpdateOrderStatusAsync(int orderId, string status)
{
    var order = await _context.Orders
        .Include(o => o.Customer)
        .Include(o => o.Warehouse) // Include warehouse
        .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
        .FirstOrDefaultAsync(o => o.Id == orderId);

    if (order == null)
        throw new ArgumentException("Order not found");

    // Validate status
    var validStatuses = new[] { "Pending", "Processing", "Shipped", "Completed", "Cancelled" };
    if (!validStatuses.Contains(status))
        throw new ArgumentException("Invalid order status");

    order.OrderStatus = status;
    order.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    // Return the updated order with all details including warehouse info
    return new OrderDto
    {
        Id = order.Id,
        CustomerId = order.CustomerId,
        CustomerName = order.Customer.CustomerName,
        TotalAmount = order.TotalAmount,
        OrderDate = order.OrderDate,
        Notes = order.Notes,
        OrderStatus = order.OrderStatus,
        ShippingAddress = order.Customer.ShippingAddress ?? "",
        Latitude = order.Customer.Latitude,
        Longitude = order.Customer.Longitude,
        WarehouseId = order.WarehouseId,
        WarehouseName = order.Warehouse?.Name,
        WarehouseAddress = order.Warehouse?.Address,
        WarehouseLatitude = order.Warehouse?.Latitude ?? 0,
        WarehouseLongitude = order.Warehouse?.Longitude ?? 0,
        OrderItems = order.OrderItems.Select(oi => new OrderItemDto
        {
            Id = oi.Id,
            ProductId = oi.ProductId,
            ProductName = oi.Product.Name,
            Quantity = oi.Quantity,
            UnitPrice = oi.UnitPrice,
            TotalPrice = oi.TotalPrice
        }).ToList()
    };
}

        public async Task DeleteOrderAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                throw new ArgumentException("Order not found");

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
        }
    }
}