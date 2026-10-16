using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.Models
{
    public class Product
    {
    public int Id { get; set; }
        [MaxLength(200)]
        public string? Name { get; set; }
        public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public DateTime? CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public int SellerId { get; set; }
    public Seller? Seller { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    public int BrandId { get; set; }
    public Brand? Brand { get; set; }
        public bool IsActive { get; set; } = false;
        public ICollection<ProdImg> ?ProdImgs { get; set; }
    public ICollection<Review> ?Reviews { get; set; }
    }
}
