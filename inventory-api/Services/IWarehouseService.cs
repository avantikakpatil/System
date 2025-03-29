// Services/IWarehouseService.cs
using inventory_api.Models;
using inventory_api.Models.DTOs;

namespace inventory_api.Services
{
    public interface IWarehouseService
    {
        Task<IEnumerable<WarehouseDto>> GetAllWarehousesAsync();
        Task<WarehouseDto> GetWarehouseByIdAsync(int id);
        Task<WarehouseDto> CreateWarehouseAsync(CreateWarehouseDto warehouseDto);
        Task<WarehouseDto> UpdateWarehouseAsync(int id, UpdateWarehouseDto warehouseDto);
        Task<bool> DeleteWarehouseAsync(int id);
    }
}