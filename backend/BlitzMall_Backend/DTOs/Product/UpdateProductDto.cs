using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.Product
{
    public class UpdateProductDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required, Range(0.1, 1000000000)]
        public decimal Price { get; set; }
        [Required, Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        [Required]
        public int BrandId { get; set; }

        [Required]
        public int CategoryId { get; set; }
        public List<string>? ImgUrls { get; set; }
        public bool IsActive { get; set; }
    }
}
