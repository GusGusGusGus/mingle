using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Intefaces;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;

        public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, ITokenService tokenService, IMapper mapper)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _tokenService = tokenService;
            _mapper = mapper;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDTO>> Register(RegisterDto registerDto)
        {
            if (await UserExists(registerDto.UserName)) return BadRequest("UserName is taken");

            var user = _mapper.Map<AppUser>(registerDto);

            //now managed with ASP.NET Identity
            // using var hmac = new HMACSHA512();

            user.UserName = registerDto.UserName.ToLower();
            // user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password));
            // user.PasswordSalt = hmac.Key;

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if(!result.Succeeded) return BadRequest(result.Errors);

            var roleResult = await _userManager.AddToRoleAsync(user, "Member");

            if(!roleResult.Succeeded) return BadRequest(result.Errors);

            return new UserDTO
            {
                Username = user.UserName,
                Token = await _tokenService.CreateToken(user),
                Gender = user.Gender,
                KnownAs = user.KnownAs
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDTO>> Login(LoginDTO loginDto)
        {
            var user = await _userManager.Users
            .Include(p => p.Photos)
            .SingleOrDefaultAsync(x => x.UserName == loginDto.UserName.ToLower())   ;
            
            if(user == null) return Unauthorized("Invalid username");

            var result = await _signInManager
                .CheckPasswordSignInAsync(user, loginDto.Password, false);

            if(!result.Succeeded) return Unauthorized();

            // using var hmac = new HMACSHA512(user.PasswordSalt);

            // var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            // for (int i = 0; i < computedHash.Length; i++)
            // {
            //     if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid Password");
            // }
            
            return new UserDTO
            {
                Username = user.UserName,
                KnownAs = user.KnownAs,
                Gender = user.Gender,
                Token = await _tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url,

            };
        }

        private async Task<bool> UserExists(string userName)
        {
            return await _userManager.Users.AnyAsync(x => x.UserName == userName.ToLower());
        }
    }
}