using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.Cart
{
    public class CartDto
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }

        public List<CartItemDto> Items { get; set; } = new();
    }
}
