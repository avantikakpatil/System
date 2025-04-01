using inventory_api.Models.DTOs;
using inventory_api.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace inventory_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrucksController : ControllerBase
    {
        private readonly ITruckService _truckService;
        private readonly ILogger<TrucksController> _logger;

        public TrucksController(ITruckService truckService, ILogger<TrucksController> logger)
        {
            _truckService = truckService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<TruckDto>>> GetAllTrucks()
        {
            try
            {
                return await _truckService.GetAllTrucksAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all trucks");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TruckDto>> GetTruckById(int id)
        {
            try
            {
                var truck = await _truckService.GetTruckByIdAsync(id);
                if (truck == null)
                    return NotFound();

                return truck;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting truck {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<TruckDto>> CreateTruck(CreateTruckDto createTruckDto)
        {
            try
            {
                var truck = await _truckService.CreateTruckAsync(createTruckDto);
                return CreatedAtAction(nameof(GetTruckById), new { id = truck.Id }, truck);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating truck");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("assign")]
        public async Task<ActionResult> AssignTruck(AssignTruckDto assignTruckDto)
        {
            try
            {
                var result = await _truckService.AssignOrdersToTruckAsync(assignTruckDto);
                if (!result)
                    return BadRequest("Failed to assign orders to truck");

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning truck");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTruck(int id)
        {
            try
            {
                var result = await _truckService.DeleteTruckAsync(id);
                if (!result)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting truck {id}");
                return StatusCode(500, "Internal server error");
            }
        }
        
        // Simplified assigned orders endpoint
        [HttpGet("assigned-orders")]
        public async Task<ActionResult> GetAssignedOrders()
        {
            try
            {
                // Get all orders that have a truck assigned
                var orders = await _truckService.GetOrdersWithTruckAssignmentAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting assigned orders");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}