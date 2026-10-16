using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.Models
{
    public class ProdImg
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        [MaxLength(500)]
        public string? UrlImage { get; set; }
    }
}
