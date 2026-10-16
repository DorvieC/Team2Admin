using System.Security.Claims;
using BlitzMall_Backend.Data;
using BlitzMall_Backend.DTOs.Seller;
using BlitzMall_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace BlitzMall_Backend.Services
{
    public class SellerService : ISellerService
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SellerService(
            AppDbContext db,
            IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        private int? GetCurrentUserId()
        {
            var claim = _httpContextAccessor.HttpContext?
                .User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(claim, out int id) ? id : null;
        }

        public async Task<List<SellerDto>> GetAllAsync()
        {
            return await _db.Sellers
                .Select(s => new SellerDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    UserId = s.UserId,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<SellerDto?> GetByIdAsync(int id)
        {
            return await _db.Sellers
                .Where(s => s.Id == id)
                .Select(s => new SellerDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    UserId = s.UserId,
                    CreatedAt = s.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<SellerDetailDto?> GetDetailsByIdAsync(int id)
        {
            return await _db.Sellers
                .Where(s => s.Id == id)
                .Select(s => new SellerDetailDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    UserId = s.UserId,
                    CreatedAt = s.CreatedAt,
                    Phone = s.Phone,
                    Email = s.Email
                })
                .FirstOrDefaultAsync();
        }

        public async Task<SellerDetailDto> CreateAsync(CreateSellerDto dto)
        {
            var userId = GetCurrentUserId()
                ?? throw new UnauthorizedAccessException("User is not authorized.");

            if (await _db.Sellers.AnyAsync(s => s.UserId == userId))
                throw new InvalidOperationException("User already has a seller profile.");

            var seller = new Seller
            {
                Name = dto.Name,
                Description = dto.Description,
                Phone = dto.Phone,
                Email = dto.Email,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Sellers.Add(seller);
            await _db.SaveChangesAsync();

            return new SellerDetailDto
            {
                Id = seller.Id,
                Name = seller.Name,
                Description = seller.Description,
                UserId = seller.UserId,
                CreatedAt = seller.CreatedAt,
                Phone = seller.Phone,
                Email = seller.Email
            };
        }

        public async Task<SellerDetailDto?> UpdateAsync(int id, UpdateSellerDto dto)
        {
            var userId = GetCurrentUserId()
                ?? throw new UnauthorizedAccessException("User is not authorized.");

            var seller = await _db.Sellers.FirstOrDefaultAsync(s => s.Id == id);

            if (seller == null)
                return null;

            if (seller.UserId != userId)
                throw new UnauthorizedAccessException("You can update only your own seller profile.");

            seller.Name = dto.Name;
            seller.Description = dto.Description;
            seller.Phone = dto.Phone;
            seller.Email = dto.Email;

            await _db.SaveChangesAsync();

            return new SellerDetailDto
            {
                Id = seller.Id,
                Name = seller.Name,
                Description = seller.Description,
                UserId = seller.UserId,
                CreatedAt = seller.CreatedAt,
                Phone = seller.Phone,
                Email = seller.Email
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var userId = GetCurrentUserId()
                ?? throw new UnauthorizedAccessException("User is not authorized.");

            var seller = await _db.Sellers.FirstOrDefaultAsync(s => s.Id == id);

            if (seller == null)
                return false;

            if (seller.UserId != userId)
                throw new UnauthorizedAccessException("You can delete only your own seller profile.");

            _db.Sellers.Remove(seller);
            await _db.SaveChangesAsync();

            return true;
        }
    }
}
