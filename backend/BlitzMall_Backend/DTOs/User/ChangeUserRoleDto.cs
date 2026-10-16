using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.User
{
    public class ChangeUserRoleDto
    {
        [Range(1, int.MaxValue)]
        public int RoleId { get; set; }
    }
}