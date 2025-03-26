using inventory_api.Models.DTOs;

namespace inventory_api.Services
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(CreateOrderDto orderDto);
        Task<List<OrderDto>> GetAllOrdersAsync();
        Task<OrderDto> GetOrderByIdAsync(int orderId);
        Task<OrderDto> UpdateOrderStatusAsync(int orderId, string status);
        Task DeleteOrderAsync(int orderId);
    }
}