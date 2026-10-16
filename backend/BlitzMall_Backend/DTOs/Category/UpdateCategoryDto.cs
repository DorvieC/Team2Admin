using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.Category
{
    public class UpdateCategoryDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int? ParentCategoryId { get; set; }
    }
}