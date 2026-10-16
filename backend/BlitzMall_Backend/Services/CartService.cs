using System.Security.Claims;
using BlitzMall_Backend.Data;
using BlitzMall_Backend.DTOs.Cart;
using BlitzMall_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace BlitzMall_Backend.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CartService(
            AppDbContext db,
            IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        private int? GetUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?
                .User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return null;
            }

            return userId;
        }

        public async Task<CartDto?> GetMyCartAsync()
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return null;
            }

            return await _db.Carts
                .Where(c => c.UserId == userId)
                .Select(c => new CartDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    CreatedDate = c.CreatedDate,
                    UpdatedDate = c.UpdatedDate,
                    Items = c.CartItems!
                        .Select(i => new CartItemDto
                        {
                            Id = i.Id,
                            CartId = i.CartId,
                            ProductId = i.ProductId,
                            Quantity = i.Quantity,
                            UnitPrice = i.UnitPrice
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<CartItemDto?> AddItemAsync(CreateCartItemDto dto)
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return null;
            }

            var cart = await _db.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId.Value,
                    CreatedDate = DateTime.UtcNow
                };

                _db.Carts.Add(cart);
                await _db.SaveChangesAsync();
            }

            var product = await _db.Products
                .FirstOrDefaultAsync(p => p.Id == dto.ProductId);

            if (product == null)
            {
                return null;
            }

            var existingItem = await _db.CartItems
                .FirstOrDefaultAsync(i =>
                    i.CartId == cart.Id &&
                    i.ProductId == dto.ProductId);

            if (existingItem != null)
            {
                existingItem.Quantity += dto.Quantity;
                existingItem.UnitPrice = product.Price;
            }
            else
            {
                existingItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    UnitPrice = product.Price
                };

                _db.CartItems.Add(existingItem);
            }

            cart.UpdatedDate = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return new CartItemDto
            {
                Id = existingItem.Id,
                CartId = existingItem.CartId,
                ProductId = existingItem.ProductId,
                Quantity = existingItem.Quantity,
                UnitPrice = existingItem.UnitPrice
            };
        }

        public async Task<CartItemDto?> UpdateItemAsync(
            int itemId,
            UpdateCartItemDto dto)
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return null;
            }

            var item = await _db.CartItems
                .Include(i => i.Cart)
                .FirstOrDefaultAsync(i =>
                    i.Id == itemId &&
                    i.Cart!.UserId == userId);

            if (item == null)
            {
                return null;
            }

            item.Quantity = dto.Quantity;
            item.Cart!.UpdatedDate = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return new CartItemDto
            {
                Id = item.Id,
                CartId = item.CartId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            };
        }

        public async Task<bool> DeleteItemAsync(int itemId)
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return false;
            }

            var item = await _db.CartItems
                .Include(i => i.Cart)
                .FirstOrDefaultAsync(i =>
                    i.Id == itemId &&
                    i.Cart!.UserId == userId);

            if (item == null)
            {
                return false;
            }

            item.Cart!.UpdatedDate = DateTime.UtcNow;

            _db.CartItems.Remove(item);

            await _db.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ClearCartAsync()
        {
            var userId = GetUserId();

            if (userId == null)
            {
                return false;
            }

            var cart = await _db.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return false;
            }

            _db.CartItems.RemoveRange(cart.CartItems!);

            cart.UpdatedDate = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return true;
        }
    }
}
