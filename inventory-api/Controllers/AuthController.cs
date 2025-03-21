// Controllers/AuthController.cs
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using inventory_api.Models.DTOs;
using inventory_api.Services;

namespace inventory_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var response = await _authService.LoginAsync(loginDto);
            if (response == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            
            return Ok(response);
        }
    }
}