
using System.ComponentModel.DataAnnotations;

namespace BlitzMall_Backend.Models
    {
        public class Delivery
        {
            public int Id { get; set; }

            public int OrderId { get; set; }
            public Order? Order { get; set; }

        [MaxLength(50)]
        public string? Method { get; set; }

        [MaxLength(100)]
        public string? Carrier { get; set; }

        [MaxLength(100)]
        public string? TrackingNumber { get; set; }
        [MaxLength(50)]
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
            public DateTime? ShippedAt { get; set; }
            public DateTime? DeliveredAt { get; set; }
        }
    }
