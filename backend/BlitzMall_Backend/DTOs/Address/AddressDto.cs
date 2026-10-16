namespace BlitzMall_Backend.DTOs.Address
{
    public class AddressDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Country { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Apartment { get; set; } = string.Empty;
        public string BuildingNumber { get; set; } = string.Empty;
    }
}