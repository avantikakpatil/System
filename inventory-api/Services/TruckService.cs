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
        
        public async Task<List<TruckDto>> GetAvailableTrucksAsync()
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
                IsAvailable = true,
                LastMaintenanceDate = DateTime.UtcNow // Set initial maintenance date
            };

            _context.Trucks.Add(truck);
            await _context.SaveChangesAsync();

            return new TruckDto
            {
                Id = truck.Id,
                TruckNumber = truck.TruckNumber,
                DriverName = truck.DriverName,
                IsAvailable = truck.IsAvailable,
                LastMaintenanceDate = truck.LastMaintenanceDate,
                AssignedOrderIds = new List<int>()
            };
        }

        public async Task<bool> AssignOrdersToTruckAsync(AssignTruckDto assignTruckDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Find existing truck by ID instead of truck number
                var truck = await _context.Trucks
                    .Include(t => t.AssignedOrders)
                    .FirstOrDefaultAsync(t => t.Id == assignTruckDto.TruckId);

                if (truck == null)
                {
                    return false;
                }
                
                // Update driver name if provided
                if (!string.IsNullOrEmpty(assignTruckDto.DriverName))
                {
                    truck.DriverName = assignTruckDto.DriverName;
                }
                
                // Set truck as not available when orders are assigned
                truck.IsAvailable = assignTruckDto.OrderIds.Count == 0;

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

        public async Task<List<dynamic>> GetOrdersWithTruckAssignmentAsync()
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
                        truckId = o.Truck != null ? o.Truck.Id : 0,
                        warehouseName = o.WarehouseName ?? string.Empty
                    })
                    .ToListAsync();

                return assignedOrders.Cast<dynamic>().ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetOrdersWithTruckAssignmentAsync: {ex.Message}");
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
            }

            _context.Trucks.Remove(truck);
            await _context.SaveChangesAsync();
            return true;
        }
        
        // Method to get assigned orders with truck information
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
                        truckId = o.Truck != null ? o.Truck.Id : 0,
                        warehouseName = o.WarehouseName ?? string.Empty
                    })
                    .ToListAsync();
                    
                return assignedOrders.Cast<object>().ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAssignedOrdersAsync: {ex.Message}");
                throw;
            }
        }
    }
}