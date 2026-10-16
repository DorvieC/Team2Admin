using BlitzMall_Backend.Data;
using BlitzMall_Backend.DTOs.Role;
using BlitzMall_Backend.Models;

using Microsoft.EntityFrameworkCore;

namespace BlitzMall_Backend.Services
{
    public class RoleService : IRoleService
    {
     
        private readonly AppDbContext _db;

        public RoleService(
            AppDbContext db
        )
        {
            _db = db;
          
        }

        public async Task<List<RoleDto>> GetAllAsync()
        {
            return await _db.Roles
             .Select(r => new RoleDto
             {
                 Id = r.Id,              
                 Name = r.Name,
                 Description = r.Description
             })

               
                .ToListAsync();
        }

        public async Task<RoleDto?> GetByIdAsync(int id)
        {
            return await _db.Roles
                .Where(r => r.Id == id)
              .Select(r => new RoleDto
              {
                  Id = r.Id,              
                  Name = r.Name,
                  Description = r.Description
              })

              
                .FirstOrDefaultAsync();
        }

        public async Task<RoleDto> CreateAsync(CreateRoleDto dto)
        {
            if (await _db.Roles.AnyAsync(r => r.Name == dto.Name))
            {
                throw new InvalidOperationException(
                    "A role with this name already exists.");
            }

            var role = new Role
            {
                Name = dto.Name,
                Description = dto.Description
            };

            _db.Roles.Add(role);

            await _db.SaveChangesAsync();

            return new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description
            };
        }

        public async Task<RoleDto?> UpdateAsync(int id, UpdateRoleDto dto)
        {
            var role = await _db.Roles
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null)
            {
                return null;
            }

            role.Name = dto.Name;
            role.Description = dto.Description;

            await _db.SaveChangesAsync();

            return new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var role = await _db.Roles
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null)
            {
                return false;
            }

            if (await _db.Users.AnyAsync(u => u.RoleId == id))
            {
                throw new InvalidOperationException(
                    "Cannot delete a role that is assigned to users.");
            }

            _db.Roles.Remove(role);

            await _db.SaveChangesAsync();

            return true;
        }
    }
}
