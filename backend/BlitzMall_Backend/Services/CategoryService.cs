using BlitzMall_Backend.Data;
using BlitzMall_Backend.DTOs.Category;
using BlitzMall_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace BlitzMall_Backend.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _db;

        public CategoryService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<CategoryDto>> GetAllAsync()
        {
            return await _db.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name ?? string.Empty,
                    Description = c.Description,
                    ParentCategoryId = c.ParentCategoryId
                })
                .ToListAsync();
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            return await _db.Categories
                .Where(c => c.Id == id)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name ?? string.Empty,
                    Description = c.Description,
                    ParentCategoryId = c.ParentCategoryId
                })
                .FirstOrDefaultAsync();
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
        {
            if (dto.ParentCategoryId.HasValue)
            {
                var parentExists = await _db.Categories
                    .AnyAsync(c => c.Id == dto.ParentCategoryId.Value);

                if (!parentExists)
                {
                    throw new InvalidOperationException(
                        "Parent category not found.");
                }
            }

            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description,
                ParentCategoryId = dto.ParentCategoryId
            };

            _db.Categories.Add(category);

            await _db.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name ?? string.Empty,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId
            };
        }

        public async Task<CategoryDto?> UpdateAsync(
            int id,
            UpdateCategoryDto dto)
        {
            var category = await _db.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return null;
            }

            if (dto.ParentCategoryId.HasValue)
            {
                if (dto.ParentCategoryId.Value == id)
                {
                    throw new InvalidOperationException(
                        "A category cannot be its own parent.");
                }

                var parentExists = await _db.Categories
                    .AnyAsync(c => c.Id == dto.ParentCategoryId.Value);

                if (!parentExists)
                {
                    throw new InvalidOperationException(
                        "Parent category not found.");
                }
            }

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.ParentCategoryId = dto.ParentCategoryId;

            await _db.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name ?? string.Empty,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _db.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return false;
            }

            var hasChildren = await _db.Categories
                .AnyAsync(c => c.ParentCategoryId == id);

            if (hasChildren)
            {
                throw new InvalidOperationException(
                    "Cannot delete a category that has child categories.");
            }

            _db.Categories.Remove(category);

            await _db.SaveChangesAsync();

            return true;
        }
    }
}