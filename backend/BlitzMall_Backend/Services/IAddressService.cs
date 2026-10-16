using BlitzMall_Backend.DTOs.Address;

namespace BlitzMall_Backend.Services
{
    public interface IAddressService
    {
        Task<List<AddressDto>> GetAllAsync();
        Task<AddressDto?> GetByIdAsync(int id);
        Task<AddressDto> CreateAsync(CreateAddressDto dto);
        Task<AddressDto?> UpdateAsync(int id, UpdateAddressDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
