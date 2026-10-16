using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.DTOs.Review
{
    public class UpdateReviewDto
    {
        public string? Text { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }
    }
}