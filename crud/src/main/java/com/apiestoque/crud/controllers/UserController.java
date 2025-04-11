package com.apiestoque.crud.controllers;

import com.apiestoque.crud.domain.user.dto.AuthenticationDTO;
import com.apiestoque.crud.domain.user.dto.LoginResponseDTO;
import com.apiestoque.crud.domain.user.dto.RegisterUserDTO;
import com.apiestoque.crud.domain.user.dto.UserResponseDTO;
import com.apiestoque.crud.infra.response.ApiResponse;
import com.apiestoque.crud.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import com.apiestoque.crud.domain.user.User;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody AuthenticationDTO data) {
        try {
            LoginResponseDTO response = userService.authenticateUser(data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponseDTO(e.getMessage()));
        }
    }

    @PostMapping("/verify-face")
    public ResponseEntity<Map<String, Object>> verifyFace(@RequestBody Map<String, String> payload) {
        try {
            Map<String, Object> result = userService.verifyFace(payload.get("image"), payload.get("email"));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse> registerAdmin(@RequestBody RegisterUserDTO data) {
        ApiResponse response = userService.registerAdmin(data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/user")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody RegisterUserDTO data) {
        ApiResponse response = userService.registerUser(data);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<LoginResponseDTO> refreshToken(@RequestBody String refreshToken) {
        try {
            String newToken = userService.refreshToken(refreshToken);
            return ResponseEntity.ok(new LoginResponseDTO(newToken));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new LoginResponseDTO(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getLoggedUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        UserResponseDTO dto = userService.getLoggedUser(user);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> listUsers() {
        List<UserResponseDTO> dtos = userService.listUsers();
        return ResponseEntity.ok(dtos);
    }
}
