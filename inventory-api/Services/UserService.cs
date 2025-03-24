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
    public interface IUserService
    {
        Task<List<UserDto>> GetAllUsersAsync();
        Task<UserDto> GetUserByIdAsync(int id);
        Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
        Task<UserDto> UpdateUserAsync(int id, CreateUserDto updateUserDto);
        Task<bool> DeleteUserAsync(int id);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users.ToListAsync();
            return users.Select(MapToDto).ToList();
        }

        public async Task<UserDto> GetUserByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            return user != null ? MapToDto(user) : null;
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == createUserDto.Email))
            {
                throw new InvalidOperationException("Email is already registered");
            }

            var user = new User
            {
                CustomerName = createUserDto.CustomerName,
                Email = createUserDto.Email,
                PhoneNumber = createUserDto.PhoneNumber,
                BillingAddress = createUserDto.BillingAddress,
                ShippingAddress = createUserDto.ShippingAddress,
                Latitude = createUserDto.Latitude,
                Longitude = createUserDto.Longitude,
                GSTNumber = createUserDto.GSTNumber,
                CompanyName = createUserDto.CompanyName,
                Notes = createUserDto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return MapToDto(user);
        }

        public async Task<UserDto> UpdateUserAsync(int id, CreateUserDto updateUserDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return null;
            }

            // Check if trying to update to an email that already exists for another user
            if (updateUserDto.Email != user.Email &&
                await _context.Users.AnyAsync(u => u.Email == updateUserDto.Email))
            {
                throw new InvalidOperationException("Email is already registered");
            }

            user.CustomerName = updateUserDto.CustomerName;
            user.Email = updateUserDto.Email;
            user.PhoneNumber = updateUserDto.PhoneNumber;
            user.BillingAddress = updateUserDto.BillingAddress;
            user.ShippingAddress = updateUserDto.ShippingAddress;
            user.Latitude = updateUserDto.Latitude;
            user.Longitude = updateUserDto.Longitude;
            user.GSTNumber = updateUserDto.GSTNumber;
            user.CompanyName = updateUserDto.CompanyName;
            user.Notes = updateUserDto.Notes;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(user);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return false;
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }

        private UserDto MapToDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                CustomerName = user.CustomerName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                BillingAddress = user.BillingAddress,
                ShippingAddress = user.ShippingAddress,
                Latitude = user.Latitude,
                Longitude = user.Longitude,
                GSTNumber = user.GSTNumber,
                CompanyName = user.CompanyName,
                Notes = user.Notes,
                CreatedAt = user.CreatedAt
            };
        }
    }
}