using BlitzMall_Backend.DTOs.Seller;
using BlitzMall_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlitzMall_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public SellerController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }

        [HttpGet]
        public async Task<ActionResult<List<SellerDto>>> GetAll()
        {
            var sellers = await _sellerService.GetAllAsync();
            return Ok(sellers);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SellerDto>> GetById(int id)
        {
            var seller = await _sellerService.GetByIdAsync(id);

            if (seller == null)
                return NotFound("Seller not found.");

            return Ok(seller);
        }

        [Authorize]
        [HttpGet("{id}/details")]
        public async Task<ActionResult<SellerDetailDto>> GetDetails(int id)
        {
            var seller = await _sellerService.GetDetailsByIdAsync(id);

            if (seller == null)
                return NotFound("Seller not found.");

            return Ok(seller);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<SellerDetailDto>> Create(
            [FromBody] CreateSellerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var seller = await _sellerService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = seller.Id },
                    seller);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<SellerDetailDto>> Update(
            int id,
            [FromBody] UpdateSellerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var seller = await _sellerService.UpdateAsync(id, dto);

                if (seller == null)
                    return NotFound("Seller not found.");

                return Ok(seller);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _sellerService.DeleteAsync(id);

                if (!deleted)
                    return NotFound("Seller not found.");

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}
