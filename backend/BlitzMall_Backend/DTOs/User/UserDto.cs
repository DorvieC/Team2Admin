using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.User
{
    public class UserDto
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; }

        [Required, MaxLength(254)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        [Required]
        public int RoleId { get; set; }
    }
}