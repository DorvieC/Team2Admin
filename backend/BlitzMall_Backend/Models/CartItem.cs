using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.Models
{
    public class CartItem
    {
    public int Id { get; set; }
    public int CartId { get; set; }
    public int ProductId { get; set; }
    public Cart? Cart { get; set; }
    public Product? Product { get; set; }
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal UnitPrice { get; set; }
    }
  
    }

