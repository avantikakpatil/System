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

            var order = new Order
            {
                CustomerId = orderDto.CustomerId,
                TotalAmount = totalAmount,
                OrderDate = DateTime.UtcNow,
                Notes = orderDto.Notes,
                OrderItems = orderItems
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
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                throw new ArgumentException("Order not found");

            return new OrderDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                CustomerName = order.Customer.CustomerName,
                TotalAmount = order.TotalAmount,
                OrderDate = order.OrderDate,
                Notes = order.Notes,
                OrderStatus = order.OrderStatus,
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
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                throw new ArgumentException("Order not found");

            order.OrderStatus = status;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetOrderByIdAsync(orderId);
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