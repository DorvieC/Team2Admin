using BlitzMall_Backend.Data;
using BlitzMall_Backend.DTOs.Address;
using BlitzMall_Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BlitzMall_Backend.Services
{
    public class AddressService : IAddressService
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AddressService(
            AppDbContext db,
            IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<AddressDto>> GetAllAsync()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?
                .User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException();
            }

            int userId = int.Parse(userIdClaim);

            return await _db.Addresses
                .Where(a => a.UserId == userId)
                .Select(a => new AddressDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    Country = a.Country ?? string.Empty,
                    City = a.City ?? string.Empty,
                    Region = a.Region ?? string.Empty,
                    Street = a.Street ?? string.Empty,
                    PostalCode = a.PostalCode ?? string.Empty,
                    Apartment = a.Apartment ?? string.Empty,
                    BuildingNumber = a.BuildingNumber ?? string.Empty
                })
                .ToListAsync();
        }
        public async Task<AddressDto?> GetByIdAsync(int id)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?
                .User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException();
            }

            int userId = int.Parse(userIdClaim);

            return await _db.Addresses
                .Where(a => a.Id == id && a.UserId == userId)
                .Select(a => new AddressDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    Country = a.Country ?? string.Empty,
                    City = a.City ?? string.Empty,
                    Region = a.Region ?? string.Empty,
                    Street = a.Street ?? string.Empty,
                    PostalCode = a.PostalCode ?? string.Empty,
                    Apartment = a.Apartment ?? string.Empty,
                    BuildingNumber = a.BuildingNumber ?? string.Empty
                })
                .FirstOrDefaultAsync();
        }
        public async Task<AddressDto> CreateAsync(CreateAddressDto dto)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?
                .User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException();
            }

            int userId = int.Parse(userIdClaim);

            var address = new Address
            {
                UserId = userId,
                Country = dto.Country,
                City = dto.City,
                Region = dto.Region,
                Street = dto.Street,
                PostalCode = dto.PostalCode,
                Apartment = dto.Apartment,
                BuildingNumber = dto.BuildingNumber
            };

            _db.Addresses.Add(address);

            await _db.SaveChangesAsync();

            return new AddressDto
            {
                Id = address.Id,
                UserId = address.UserId,
                Country = address.Country ?? string.Empty,
                City = address.City ?? string.Empty,
                Region = address.Region ?? string.Empty,
                Street = address.Street ?? string.Empty,
                PostalCode = address.PostalCode ?? string.Empty,
                Apartment = address.Apartment ?? string.Empty,
                BuildingNumber = address.BuildingNumber ?? string.Empty
            };
        }

        public async Task<AddressDto?> UpdateAsync(
            int id,
            UpdateAddressDto dto)
        {
            var address = await _db.Addresses
                .FirstOrDefaultAsync(a => a.Id == id);

            if (address == null)
            {
                return null;
            }

            var userIdClaim = _httpContextAccessor.HttpContext?
                .User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException();
            }

            int userId = int.Parse(userIdClaim);

            if (address.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You cannot update this address.");
            }

            address.Country = dto.Country;
            address.City = dto.City;
            address.Region = dto.Region;
            address.Street = dto.Street;
            address.PostalCode = dto.PostalCode;
            address.Apartment = dto.Apartment;
            address.BuildingNumber = dto.BuildingNumber;

            await _db.SaveChangesAsync();

            return new AddressDto
            {
                Id = address.Id,
                UserId = address.UserId,
                Country = address.Country ?? string.Empty,
                City = address.City ?? string.Empty,
                Region = address.Region ?? string.Empty,
                Street = address.Street ?? string.Empty,
                PostalCode = address.PostalCode ?? string.Empty,
                Apartment = address.Apartment ?? string.Empty,
                BuildingNumber = address.BuildingNumber ?? string.Empty
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var address = await _db.Addresses
                .FirstOrDefaultAsync(a => a.Id == id);

            if (address == null)
            {
                return false;
            }

            var userIdClaim = _httpContextAccessor.HttpContext?
                .User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException();
            }

            int userId = int.Parse(userIdClaim);

            if (address.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You cannot delete this address.");
            }

            _db.Addresses.Remove(address);

            await _db.SaveChangesAsync();

            return true;
        }
    }
}