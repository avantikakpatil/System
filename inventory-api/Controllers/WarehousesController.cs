// Controllers/WarehousesController.cs
using inventory_api.Models.DTOs;
using inventory_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inventory_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class WarehousesController : ControllerBase

    {
        private readonly IWarehouseService _warehouseService;

        public WarehousesController(IWarehouseService warehouseService)
        {
            _warehouseService = warehouseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WarehouseDto>>> GetWarehouses()
        {
            var warehouses = await _warehouseService.GetAllWarehousesAsync();
            return Ok(warehouses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WarehouseDto>> GetWarehouse(int id)
        {
            var warehouse = await _warehouseService.GetWarehouseByIdAsync(id);
            if (warehouse == null)
                return NotFound();

            return Ok(warehouse);
        }

        [HttpPost]
        public async Task<ActionResult<WarehouseDto>> CreateWarehouse(CreateWarehouseDto warehouseDto)
        {
            var createdWarehouse = await _warehouseService.CreateWarehouseAsync(warehouseDto);
            return CreatedAtAction(nameof(GetWarehouse), new { id = createdWarehouse.Id }, createdWarehouse);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWarehouse(int id, UpdateWarehouseDto warehouseDto)
        {
            var updatedWarehouse = await _warehouseService.UpdateWarehouseAsync(id, warehouseDto);
            if (updatedWarehouse == null)
                return NotFound();

            return Ok(updatedWarehouse);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWarehouse(int id)
        {
            var result = await _warehouseService.DeleteWarehouseAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}