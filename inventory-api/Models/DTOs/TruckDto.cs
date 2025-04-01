// Models/DTOs/TruckDto.cs
namespace inventory_api.Models.DTOs
{
    public class TruckDto
    {
        public int Id { get; set; }
        public string TruckNumber { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public DateTime? LastMaintenanceDate { get; set; }
        public List<int> AssignedOrderIds { get; set; } = new List<int>();
    }

    public class CreateTruckDto
    {
        public string TruckNumber { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
    }

    public class AssignTruckDto
    {
        public List<int> OrderIds { get; set; } = new List<int>();
        public string TruckNumber { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
    }
    public class OrderWithTruckDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int TruckId { get; set; }
        public string TruckNumber { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        // Add any other order properties you need
    }

    public class AssignedOrderDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string TruckNumber { get; set; } = string.Empty;
        public int TruckId { get; set; }
    }
}