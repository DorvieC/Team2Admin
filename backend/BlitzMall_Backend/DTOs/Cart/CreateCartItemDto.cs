using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.Cart
{
    public class CreateCartItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}