using BlitzMall_Backend.Data;
using BlitzMall_Backend.DTOs.User;
using BlitzMall_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace BlitzMall_Backend.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _db;

        public UserService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<UserDto>> GetAllAsync()
        {
            return await _db.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Status = u.Status,
                    Email = u.Email,
                    Phone = u.Phone,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    RoleId = u.RoleId
                })
                .ToListAsync();
        }

        public async Task<UserDto?> GetByIdAsync(int id)
        {
            return await _db.Users
                .Where(u => u.Id == id)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Status = u.Status,
                    Email = u.Email,
                    Phone = u.Phone,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    RoleId = u.RoleId
                })
                .FirstOrDefaultAsync();
        }

        public async Task<UserDto> CreateAsync(CreateUserDto dto)
        {
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            {
                throw new InvalidOperationException(
                    "Email already in use.");
            }

            if (!await _db.Roles.AnyAsync(r => r.Id == dto.RoleId))
            {
                throw new InvalidOperationException(
                    "Role not found.");
            }

            var user = new User
            {
                Name = dto.Name,
                Status = dto.Status,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                RoleId = dto.RoleId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Status = user.Status,
                Email = user.Email,
                Phone = user.Phone,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                RoleId = user.RoleId
            };
        }

        public async Task<UserDto?> UpdateAsync(int id, UpdateUserDto dto)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return null;
            }

            if (await _db.Users.AnyAsync(u =>
                u.Email == dto.Email && u.Id != id))
            {
                throw new InvalidOperationException(
                    "Email already in use.");
            }

            if (!await _db.Roles.AnyAsync(r => r.Id == dto.RoleId))
            {
                throw new InvalidOperationException(
                    "Role not found.");
            }

            user.Name = dto.Name;
            user.Status = dto.Status;
            user.Email = dto.Email;
            user.Phone = dto.Phone;
            user.RoleId = dto.RoleId;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Status = user.Status,
                Email = user.Email,
                Phone = user.Phone,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                RoleId = user.RoleId
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return false;
            }

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            return true;
        }
        public async Task<bool> ChangeRoleAsync(int id, int roleId)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return false;
            }

            var roleExists = await _db.Roles
                .AnyAsync(r => r.Id == roleId);

            if (!roleExists)
            {
                throw new InvalidOperationException("Role not found.");
            }

            user.RoleId = roleId;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return true;
        }
    }
}