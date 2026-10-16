using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.Brand
{
    public class UpdateBrandDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
