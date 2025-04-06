using inventory_api.Models;
using inventory_api.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace inventory_api.Services
{
    public interface ITruckService
    {
        Task<List<TruckDto>> GetAllTrucksAsync();
        Task<TruckDto> GetTruckByIdAsync(int id);
        Task<TruckDto> CreateTruckAsync(CreateTruckDto createTruckDto);
        Task<bool> AssignOrdersToTruckAsync(AssignTruckDto assignTruckDto);
        Task<bool> DeleteTruckAsync(int id);
        
        // Method for assigned orders
        Task<List<dynamic>> GetOrdersWithTruckAssignmentAsync();
        
        // New method to get available trucks
        Task<List<TruckDto>> GetAvailableTrucksAsync();
    }
}