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

import com.apiestoque.crud.domain.user.AuthenticationDTO;
import com.apiestoque.crud.domain.user.LoginResponseDTO;
import com.apiestoque.crud.domain.user.RegisterUserDTO;
import com.apiestoque.crud.domain.user.User;
import com.apiestoque.crud.infra.ApiResponse;
import com.apiestoque.crud.infra.security.TokenService;
import com.apiestoque.crud.repositories.UserRepository;

@RestController
@RequestMapping("auth")
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

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody @Validated RegisterUserDTO data) {
        if (data.role() == null) {
            return ResponseEntity.badRequest().body(new ApiResponse("User role is required"));
        }

        if (this.userRepository.findByUsername(data.username()) != null) {
            return ResponseEntity.badRequest().body(new ApiResponse("Username já existe."));
        }

        if (this.userRepository.findByEmail(data.email()) != null) {
            return ResponseEntity.badRequest().body(new ApiResponse("Email já existe."));
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());
        User newUser = new User(data.username(), data.email(), encryptedPassword, data.role());

        this.userRepository.save(newUser);

        return ResponseEntity.ok().body(new ApiResponse("User registered successfully."));
    }
}
