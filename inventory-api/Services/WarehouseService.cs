// Services/WarehouseService.cs
using inventory_api.Data;
using inventory_api.Models;
using inventory_api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace inventory_api.Services
{
    public class WarehouseService : IWarehouseService
    {
        private readonly ApplicationDbContext _context;

        public WarehouseService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<WarehouseDto>> GetAllWarehousesAsync()
        {
            var warehouses = await _context.Warehouses.ToListAsync();
            return warehouses.Select(w => new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Address = w.Address,
                Latitude = w.Latitude,
                Longitude = w.Longitude,
                IsActive = w.IsActive
            });
        }

        public async Task<WarehouseDto> GetWarehouseByIdAsync(int id)
        {
            var warehouse = await _context.Warehouses.FindAsync(id);
            if (warehouse == null)
                return null;

            return new WarehouseDto
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Address = warehouse.Address,
                Latitude = warehouse.Latitude,
                Longitude = warehouse.Longitude,
                IsActive = warehouse.IsActive
            };
        }

        public async Task<WarehouseDto> CreateWarehouseAsync(CreateWarehouseDto warehouseDto)
        {
            var warehouse = new Warehouse
            {
                Name = warehouseDto.Name,
                Address = warehouseDto.Address,
                Latitude = warehouseDto.Latitude,
                Longitude = warehouseDto.Longitude,
                IsActive = true
            };

            _context.Warehouses.Add(warehouse);
            await _context.SaveChangesAsync();

            return new WarehouseDto
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Address = warehouse.Address,
                Latitude = warehouse.Latitude,
                Longitude = warehouse.Longitude,
                IsActive = warehouse.IsActive
            };
        }

        public async Task<WarehouseDto> UpdateWarehouseAsync(int id, UpdateWarehouseDto warehouseDto)
        {
            var warehouse = await _context.Warehouses.FindAsync(id);
            if (warehouse == null)
                return null;

            warehouse.Name = warehouseDto.Name;
            warehouse.Address = warehouseDto.Address;
            warehouse.Latitude = warehouseDto.Latitude;
            warehouse.Longitude = warehouseDto.Longitude;
            warehouse.IsActive = warehouseDto.IsActive;

            await _context.SaveChangesAsync();

            return new WarehouseDto
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Address = warehouse.Address,
                Latitude = warehouse.Latitude,
                Longitude = warehouse.Longitude,
                IsActive = warehouse.IsActive
            };
        }

        public async Task<bool> DeleteWarehouseAsync(int id)
        {
            var warehouse = await _context.Warehouses.FindAsync(id);
            if (warehouse == null)
                return false;

            _context.Warehouses.Remove(warehouse);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}