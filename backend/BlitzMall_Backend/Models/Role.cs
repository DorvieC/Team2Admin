using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.Models
{
    public class Role
    {
    public int Id { get; set; }
        [MaxLength(50)]
        public string? Name { get; set; }
        public string? Description { get; set; }
  
    public ICollection<User>? Users { get; set; }
        }
}
