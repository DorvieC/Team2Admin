using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.Address
{
    public class CreateAddressDto
    {
        [Required, MaxLength(100)]
        public string Country { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Region { get; set; }

        [Required, MaxLength(200)]
        public string Street { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string PostalCode { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Apartment { get; set; }

        [Required, MaxLength(20)]
        public string BuildingNumber { get; set; } = string.Empty;
    }
}
