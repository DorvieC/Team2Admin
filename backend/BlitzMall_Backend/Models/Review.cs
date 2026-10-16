using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.Models
{
    public class Review
    {
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
        public string? Text { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [Range(1, 5)]
        public int Rating { get; set; }
    }
}
