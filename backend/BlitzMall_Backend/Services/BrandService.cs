using BlitzMall_Backend.Data;
using BlitzMall_Backend.DTOs.Brand;

using BlitzMall_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace BlitzMall_Backend.Services
{
    public class BrandService:IBrandService
    {
        private readonly AppDbContext _db;

        public BrandService(
            AppDbContext db
        )
        {
            _db = db;

        }

        public async Task<List<BrandDto>> GetAllAsync()
        {
            return await _db.Brands
             .Select(b => new BrandDto
             {
                 Id = b.Id,
                 Name = b.Name ?? string.Empty,
                 Description = b.Description
             })


                .ToListAsync();
        }

        public async Task<BrandDto?> GetByIdAsync(int id)
        {
            return await _db.Brands
                .Where(b => b.Id == id)
              .Select(b => new BrandDto
              {
                  Id = b.Id,
                  Name = b.Name ?? string.Empty,
                  Description = b.Description
              })


                .FirstOrDefaultAsync();
        }

        public async Task<BrandDto> CreateAsync(CreateBrandDto dto)
        {
            var brand = new Brand
            {
                Name = dto.Name,
                Description = dto.Description
            };

            _db.Brands.Add(brand);

            await _db.SaveChangesAsync();

            return new BrandDto
            {
                Id = brand.Id,
                Name = brand.Name ?? string.Empty,
                Description = brand.Description
            };
        }

        public async Task<BrandDto?> UpdateAsync(int id, UpdateBrandDto dto)
        {
            var brand= await _db.Brands
                .FirstOrDefaultAsync(b => b.Id == id);

            if (brand == null)
            {
                return null;
            }

            brand.Name = dto.Name;
            brand.Description = dto.Description;

            await _db.SaveChangesAsync();

            return new BrandDto
            {
                Id = brand.Id,
                Name = brand.Name ?? string.Empty,
                Description = brand.Description
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var brand= await _db.Brands
                .FirstOrDefaultAsync(b => b.Id == id);

            if (brand == null)
            {
                return false;
            }

            _db.Brands.Remove(brand);

            await _db.SaveChangesAsync();

            return true;
        }
    }
}
