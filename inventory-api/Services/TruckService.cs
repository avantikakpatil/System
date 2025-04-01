using inventory_api.Data;
using inventory_api.Models;
using inventory_api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace inventory_api.Services
{
    public class TruckService : ITruckService
    {
        private readonly ApplicationDbContext _context;

        public TruckService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TruckDto>> GetAllTrucksAsync()
        {
            var trucks = await _context.Trucks
                .Include(t => t.AssignedOrders)
                .ToListAsync();

            return trucks.Select(t => new TruckDto
            {
                Id = t.Id,
                TruckNumber = t.TruckNumber,
                DriverName = t.DriverName,
                IsAvailable = t.IsAvailable,
                LastMaintenanceDate = t.LastMaintenanceDate,
                AssignedOrderIds = t.AssignedOrders.Select(o => o.Id).ToList()
            }).ToList();
        }

        public async Task<TruckDto> GetTruckByIdAsync(int id)
        {
            var truck = await _context.Trucks
                .Include(t => t.AssignedOrders)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (truck == null)
                return null;

            return new TruckDto
            {
                Id = truck.Id,
                TruckNumber = truck.TruckNumber,
                DriverName = truck.DriverName,
                IsAvailable = truck.IsAvailable,
                LastMaintenanceDate = truck.LastMaintenanceDate,
                AssignedOrderIds = truck.AssignedOrders.Select(o => o.Id).ToList()
            };
        }

        public async Task<TruckDto> CreateTruckAsync(CreateTruckDto createTruckDto)
        {
            var truck = new Truck
            {
                TruckNumber = createTruckDto.TruckNumber,
                DriverName = createTruckDto.DriverName,
                IsAvailable = true
            };

            _context.Trucks.Add(truck);
            await _context.SaveChangesAsync();

            return new TruckDto
            {
                Id = truck.Id,
                TruckNumber = truck.TruckNumber,
                DriverName = truck.DriverName,
                IsAvailable = truck.IsAvailable,
                AssignedOrderIds = new List<int>()
            };
        }

        public async Task<bool> AssignOrdersToTruckAsync(AssignTruckDto assignTruckDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Find existing truck or create a new one
                var truck = await _context.Trucks
                    .Include(t => t.AssignedOrders)
                    .FirstOrDefaultAsync(t => t.TruckNumber == assignTruckDto.TruckNumber);

                if (truck == null)
                {
                    truck = new Truck
                    {
                        TruckNumber = assignTruckDto.TruckNumber,
                        DriverName = assignTruckDto.DriverName,
                        IsAvailable = false
                    };
                    _context.Trucks.Add(truck);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    truck.DriverName = assignTruckDto.DriverName;
                    truck.IsAvailable = false;
                }

                // Clear previous order assignments if any
                var existingOrders = await _context.Orders
                    .Where(o => o.TruckId == truck.Id)
                    .ToListAsync();

                foreach (var order in existingOrders)
                {
                    if (!assignTruckDto.OrderIds.Contains(order.Id))
                    {
                        order.TruckId = null;
                        order.Truck = null;
                        // If you have an IsSelected flag in your Order model
                        // order.IsSelected = false;
                    }
                }

                // Assign selected orders to truck
                var selectedOrders = await _context.Orders
                    .Where(o => assignTruckDto.OrderIds.Contains(o.Id))
                    .ToListAsync();

                foreach (var order in selectedOrders)
                {
                    order.TruckId = truck.Id;
                    order.Truck = truck;
                    // If you have an IsSelected flag in your Order model
                    // order.IsSelected = true;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<AssignedOrderDto>> GetOrdersWithTruckAssignmentAsync()
{
    try
    {
        // Get orders with truck assignments
        var assignedOrders = await _context.Orders
            .Where(o => o.TruckId != null)
            .Include(o => o.Truck)
            .Select(o => new AssignedOrderDto
            {
                Id = o.Id,
                CustomerName = o.CustomerName ?? string.Empty,
                WarehouseName = o.WarehouseName ?? string.Empty,
                TruckNumber = o.Truck != null ? o.Truck.TruckNumber : string.Empty,
                TruckId = o.TruckId ?? 0
            })
            .ToListAsync();

        return assignedOrders;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting orders with truck assignments");
        throw;
    }
}

        public async Task<bool> DeleteTruckAsync(int id)
        {
            var truck = await _context.Trucks.FindAsync(id);
            if (truck == null)
                return false;

            // Unassign any orders
            var orders = await _context.Orders.Where(o => o.TruckId == id).ToListAsync();
            foreach (var order in orders)
            {
                order.TruckId = null;
                order.Truck = null;
                // If you have an IsSelected flag
                // order.IsSelected = false;
            }

            _context.Trucks.Remove(truck);
            await _context.SaveChangesAsync();
            return true;
        }
        
        // New method to get assigned orders with truck information
        public async Task<List<object>> GetAssignedOrdersAsync()
{
    try
    {
        var assignedOrders = await _context.Orders
            .Where(o => o.TruckId != null)
            .Include(o => o.Truck)
            .Select(o => new
            {
                id = o.Id,
                customerName = o.CustomerName,
                truckNumber = o.Truck != null ? o.Truck.TruckNumber : string.Empty,
                warehouseName = o.WarehouseName ?? string.Empty
                // Add other order properties as needed by the frontend
            })
            .ToListAsync();
            
        return assignedOrders.Cast<object>().ToList();
    }
    catch (Exception ex)
    {
        // Log the exception details
        Console.WriteLine($"Error in GetAssignedOrdersAsync: {ex.Message}");
        // Rethrow or return empty list depending on error handling strategy
        throw;
    }
}
    }
}