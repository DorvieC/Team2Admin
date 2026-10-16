using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.Models
{
    public class Brand
    {
    public int Id { get; set; }
        [MaxLength(100)]
        public string? Name { get; set; }
        public string? Description { get; set; }
    public ICollection<Product>? Products { get; set; }
    }
}
