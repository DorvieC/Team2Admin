namespace BlitzMall_Backend.Models
{
    public class Seller
    {
   public int Id { get; set; }
  
    public string? Name { get; set; }
    public string? Description { get; set; }
   public int UserId { get; set; }
    public User?User { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public ICollection<Product>? Products { get; set; }

    }
}
