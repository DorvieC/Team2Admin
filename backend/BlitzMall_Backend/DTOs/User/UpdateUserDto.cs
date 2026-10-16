using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.User
{
    public class UpdateUserDto
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; }

        [Required, EmailAddress, MaxLength(254)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }

        [Range(1, int.MaxValue)]
        public int RoleId { get; set; }
    }
}