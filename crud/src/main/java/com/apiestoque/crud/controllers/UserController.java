package com.apiestoque.crud.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apiestoque.crud.domain.user.User;
import com.apiestoque.crud.domain.user.dto.AuthenticationDTO;
import com.apiestoque.crud.domain.user.dto.LoginResponseDTO;
import com.apiestoque.crud.domain.user.dto.RefreshTokenRequestDTO;
import com.apiestoque.crud.domain.user.dto.RegisterUserDTO;
import com.apiestoque.crud.domain.user.dto.UserRole;
import com.apiestoque.crud.infra.response.ApiResponse;
import com.apiestoque.crud.infra.security.TokenService;
import com.apiestoque.crud.repositories.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @SuppressWarnings("rawtypes")
    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Validated AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((User) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse> registerAdmin(@RequestBody @Validated RegisterUserDTO data) {
        User masterUser = userRepository.findByUsername("admin"); 
        if (masterUser == null) {
            return ResponseEntity.badRequest().body(new ApiResponse("Master user does not exist."));
        }

        if (data.role() == null || !data.role().equals(UserRole.ADMIN)) {
            return ResponseEntity.badRequest().body(new ApiResponse("A role of admin is required for this endpoint."));
        }

        if (this.userRepository.findByUsername(data.username()) != null) {
            return ResponseEntity.badRequest().body(new ApiResponse("Username já existe."));
        }

        if (this.userRepository.findByEmail(data.email()) != null) {
            return ResponseEntity.badRequest().body(new ApiResponse("Email já existe."));
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());
        User newUser = new User(data.username(), data.email(), encryptedPassword, data.status(), data.role());

        this.userRepository.save(newUser);

        return ResponseEntity.ok().body(new ApiResponse("Admin user registered successfully."));
    }

    @PostMapping("/register/user")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody @Validated RegisterUserDTO data) {
        User masterUser = userRepository.findByUsername("admin"); 
        if (masterUser == null) {
            return ResponseEntity.badRequest().body(new ApiResponse("Master user does not exist."));
        }

        if (data.role() == null || !data.role().equals(UserRole.USER)) {
            return ResponseEntity.badRequest().body(new ApiResponse("A role of user is required for this endpoint."));
        }

        if (this.userRepository.findByUsername(data.username()) != null) {
            return ResponseEntity.badRequest().body(new ApiResponse("Username já existe."));
        }

        if (this.userRepository.findByEmail(data.email()) != null) {
            return ResponseEntity.badRequest().body(new ApiResponse("Email já existe."));
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());
        User newUser = new User(data.username(), data.email(), encryptedPassword, data.status(), data.role());

        this.userRepository.save(newUser);

        return ResponseEntity.ok().body(new ApiResponse("User registered successfully."));
    }

    @SuppressWarnings("rawtypes")
    @PostMapping("/refresh-token")
    public ResponseEntity refreshToken(@RequestBody @Validated RefreshTokenRequestDTO request) {
        String refreshToken = request.refreshToken();
        
        if (tokenService.validateToken(refreshToken).equals("")) {
            return ResponseEntity.badRequest().body(new ApiResponse("Invalid refresh token."));
        }

        String username = tokenService.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body(new ApiResponse("User not found."));
        }

        String newToken = tokenService.generateToken(user);

        return ResponseEntity.ok(new LoginResponseDTO(newToken));
    }
}
