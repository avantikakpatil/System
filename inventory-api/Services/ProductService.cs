using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using inventory_api.Data;
using inventory_api.Models;
using inventory_api.Models.DTOs;

namespace inventory_api.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductService> _logger;

        public ProductService(ApplicationDbContext context, ILogger<ProductService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
        {
            try
            {
                return await _context.Products
                    .AsNoTracking()
                    .Select(p => new ProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        ProductCode = p.ProductCode,
                        Description = p.Description,
                        Category = p.Category,
                        Price = p.Price,
                        Weight = p.Weight,
                        Volume = p.Volume,
                        StockQuantity = p.StockQuantity,
                        MinimumOrderQuantity = p.MinimumOrderQuantity,
                        SupplierName = p.SupplierName,
                        ImageUrl = p.ImageUrl,
                        IsActive = p.IsActive
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching products");
                throw;
            }
        }

        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                    throw new KeyNotFoundException($"Product with ID {id} not found");

                return new ProductDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    ProductCode = product.ProductCode,
                    Description = product.Description,
                    Category = product.Category,
                    Price = product.Price,
                    Weight = product.Weight,
                    Volume = product.Volume,
                    StockQuantity = product.StockQuantity,
                    MinimumOrderQuantity = product.MinimumOrderQuantity,
                    SupplierName = product.SupplierName,
                    ImageUrl = product.ImageUrl,
                    IsActive = product.IsActive
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching product {id}");
                throw;
            }
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto)
        {
            try
            {
                var product = new Product
                {
                    Name = createProductDto.Name,
                    ProductCode = createProductDto.ProductCode,
                    Description = createProductDto.Description,
                    Category = createProductDto.Category,
                    Price = createProductDto.Price,
                    Weight = createProductDto.Weight,
                    Volume = createProductDto.Volume,
                    StockQuantity = createProductDto.StockQuantity,
                    MinimumOrderQuantity = createProductDto.MinimumOrderQuantity,
                    SupplierName = createProductDto.SupplierName,
                    ImageUrl = createProductDto.ImageUrl,
                    IsActive = createProductDto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return new ProductDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    ProductCode = product.ProductCode,
                    Description = product.Description,
                    Category = product.Category,
                    Price = product.Price,
                    Weight = product.Weight,
                    Volume = product.Volume,
                    StockQuantity = product.StockQuantity,
                    MinimumOrderQuantity = product.MinimumOrderQuantity,
                    SupplierName = product.SupplierName,
                    ImageUrl = product.ImageUrl,
                    IsActive = product.IsActive
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                throw;
            }
        }

        public async Task<ProductDto> UpdateProductAsync(int id, CreateProductDto updateProductDto)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                    throw new KeyNotFoundException($"Product with ID {id} not found");

                product.Name = updateProductDto.Name;
                product.ProductCode = updateProductDto.ProductCode;
                product.Description = updateProductDto.Description;
                product.Category = updateProductDto.Category;
                product.Price = updateProductDto.Price;
                product.Weight = updateProductDto.Weight;
                product.Volume = updateProductDto.Volume;
                product.StockQuantity = updateProductDto.StockQuantity;
                product.MinimumOrderQuantity = updateProductDto.MinimumOrderQuantity;
                product.SupplierName = updateProductDto.SupplierName;
                product.ImageUrl = updateProductDto.ImageUrl;
                product.IsActive = updateProductDto.IsActive;
                product.UpdatedAt = DateTime.UtcNow;

                _context.Products.Update(product);
                await _context.SaveChangesAsync();

                return new ProductDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    ProductCode = product.ProductCode,
                    Description = product.Description,
                    Category = product.Category,
                    Price = product.Price,
                    Weight = product.Weight,
                    Volume = product.Volume,
                    StockQuantity = product.StockQuantity,
                    MinimumOrderQuantity = product.MinimumOrderQuantity,
                    SupplierName = product.SupplierName,
                    ImageUrl = product.ImageUrl,
                    IsActive = product.IsActive
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating product {id}");
                throw;
            }
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                    return false;

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting product {id}");
                throw;
            }
        }
    }
}