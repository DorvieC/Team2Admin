using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.Role
{
    public class RoleDto
    {
    public int Id { get; set; }
        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

    }
}
