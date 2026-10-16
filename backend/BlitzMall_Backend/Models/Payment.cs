namespace BlitzMall_Backend.Models
{
    public class Payment
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public Order? Order { get; set; }

        public decimal Amount { get; set; }

        public string? Status { get; set; }

        public string? Method { get; set; }

        public string? TransactionId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}