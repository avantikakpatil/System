// Services/IProductService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using inventory_api.Models;
using inventory_api.Models.DTOs;

namespace inventory_api.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync();
        Task<ProductDto> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto);
        Task<ProductDto> UpdateProductAsync(int id, CreateProductDto updateProductDto);
        Task<bool> DeleteProductAsync(int id);
    }
}