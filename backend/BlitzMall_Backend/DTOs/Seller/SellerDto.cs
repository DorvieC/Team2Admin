using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.Seller
{
    public class SellerDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }

        [Required]
        public int UserId { get; set; }

        public DateTime CreatedAt { get; set; }
    }

    public class SellerDetailDto : SellerDto
    {
        public string? Phone { get; set; }
        public string? Email { get; set; }
    }
}
