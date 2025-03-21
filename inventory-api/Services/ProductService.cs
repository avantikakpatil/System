// Services/ProductService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using inventory_api.Data;
using inventory_api.Models;
using inventory_api.Models.DTOs;

namespace inventory_api.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;
        
        public ProductService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
        {
            var products = await _context.Products.ToListAsync();
            return products.Select(p => MapToProductDto(p));
        }
        
        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return null;
                
            return MapToProductDto(product);
        }
        
        public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto)
        {
            var product = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                Price = createProductDto.Price,
                StockQuantity = createProductDto.StockQuantity,
                Category = createProductDto.Category,
                ImageUrl = createProductDto.ImageUrl,
                IsActive = createProductDto.IsActive,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            
            return MapToProductDto(product);
        }
        
        public async Task<ProductDto> UpdateProductAsync(int id, CreateProductDto updateProductDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return null;
                
            product.Name = updateProductDto.Name;
            product.Description = updateProductDto.Description;
            product.Price = updateProductDto.Price;
            product.StockQuantity = updateProductDto.StockQuantity;
            product.Category = updateProductDto.Category;
            product.ImageUrl = updateProductDto.ImageUrl;
            product.IsActive = updateProductDto.IsActive;
            product.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return MapToProductDto(product);
        }
        
        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return false;
                
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            
            return true;
        }
        
        private ProductDto MapToProductDto(Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                Category = product.Category,
                ImageUrl = product.ImageUrl,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt
            };
        }
    }
}