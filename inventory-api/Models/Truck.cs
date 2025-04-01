// Models/Truck.cs
namespace inventory_api.Models
{
    public class Truck
    {
        public int Id { get; set; }
        public string TruckNumber { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
        public bool IsAvailable { get; set; } = true;
        public DateTime? LastMaintenanceDate { get; set; }
        public List<Order> AssignedOrders { get; set; } = new List<Order>();
    }
}