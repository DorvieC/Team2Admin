using BlitzMall_Backend.DTOs.Seller;

namespace BlitzMall_Backend.Services
{
    public interface ISellerService
    {
        Task<List<SellerDto>> GetAllAsync();
        Task<SellerDto?> GetByIdAsync(int id);
        Task<SellerDetailDto?> GetDetailsByIdAsync(int id);
        Task<SellerDetailDto> CreateAsync(CreateSellerDto dto);
        Task<SellerDetailDto?> UpdateAsync(int id, UpdateSellerDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
