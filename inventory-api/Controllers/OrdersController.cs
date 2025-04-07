using Microsoft.AspNetCore.Mvc;
using inventory_api.Services;
using inventory_api.Models.DTOs;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using inventory_api.Data;

namespace inventory_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrdersController> _logger;
        private readonly ApplicationDbContext _context; // Add this line

        public OrdersController(IOrderService orderService, ILogger<OrdersController> logger, ApplicationDbContext context) // Update constructor
        {
            _orderService = orderService;
            _logger = logger;
            _context = context; // Initialize context
        }

        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderDto orderDto)
        {
            try
            {
                // Log the received data to debug
                _logger.LogInformation("Received order data: {@OrderDto}", orderDto);
                
                // Check if WarehouseId is being properly received
                _logger.LogInformation("Warehouse ID: {WarehouseId}", orderDto.WarehouseId);
                
                var createdOrder = await _orderService.CreateOrderAsync(orderDto);
                return CreatedAtAction(nameof(GetOrderById), new { id = createdOrder.Id }, createdOrder);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument when creating order");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, new { message = "An error occurred while creating the order", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetAllOrders()
        {
            try
            {
                var orders = await _orderService.GetAllOrdersAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching orders", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            try
            {
                var order = await _orderService.GetOrderByIdAsync(id);
                return Ok(order);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the order", error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<OrderDto>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto statusDto)
        {
            try
            {
                var updatedOrder = await _orderService.UpdateOrderStatusAsync(id, statusDto.Status);
                return Ok(updatedOrder);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating order status", error = ex.Message });
            }
        }



        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteOrder(int id)
        {
            try
            {
                await _orderService.DeleteOrderAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the order", error = ex.Message });
            }
        }

[HttpGet("{id}/route")]
public async Task<ActionResult<DeliveryRouteDto>> GetOrderRoute(int id)
{
    try
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Warehouse)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound(new { message = "Order not found" });

        if (order.Customer == null || order.Warehouse == null)
            return BadRequest(new { message = "Order is missing customer or warehouse data" });

        var route = new DeliveryRouteDto
        {
            OrderId = order.Id,
            Customer = new LocationDto
            {
                Id = order.Customer.Id,
                Name = order.Customer.CustomerName,
                Address = order.Customer.ShippingAddress,
                Latitude = (decimal)order.Customer.Latitude,
                Longitude = (decimal)order.Customer.Longitude
            },
            Warehouse = new LocationDto
            {
                Id = order.Warehouse.Id,
                Name = order.Warehouse.Name,
                Address = order.Warehouse.Address,
                Latitude = (decimal)order.Warehouse.Latitude,
                Longitude = (decimal)order.Warehouse.Longitude
            }
        };

        return Ok(route);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error retrieving order route: {Message}", ex.Message);
        return StatusCode(500, new { message = "An error occurred while fetching the order route", error = ex.Message });
    }
}

    }
}