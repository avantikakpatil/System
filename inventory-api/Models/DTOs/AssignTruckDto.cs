public class AssignTruckDto
{
    public List<int> OrderIds { get; set; } = new List<int>();
    public int TruckId { get; set; }
    public string DriverName { get; set; } = string.Empty;
}