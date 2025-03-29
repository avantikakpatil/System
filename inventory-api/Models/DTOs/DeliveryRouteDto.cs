namespace inventory_api.Models.DTOs
{
    public class DeliveryRouteDto
    {
        public int OrderId { get; set; }
        public LocationDto Warehouse { get; set; }
        public LocationDto Customer { get; set; }
    }
}