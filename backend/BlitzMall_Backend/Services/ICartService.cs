using BlitzMall_Backend.DTOs.Cart;

namespace BlitzMall_Backend.Services
{
    public interface ICartService
    {
        Task<CartDto?> GetMyCartAsync();
        Task<CartItemDto?> AddItemAsync(CreateCartItemDto dto);
        Task<CartItemDto?> UpdateItemAsync(int itemId, UpdateCartItemDto dto);
        Task<bool> DeleteItemAsync(int itemId);
        Task<bool> ClearCartAsync();
    }
}