package com.apiestoque.crud.controllers;

import com.apiestoque.crud.domain.user.dto.AuthenticationDTO;
import com.apiestoque.crud.domain.user.dto.LoginResponseDTO;
import com.apiestoque.crud.domain.user.dto.RegisterUserDTO;
import com.apiestoque.crud.domain.user.dto.UpdatePasswordDTO;
import com.apiestoque.crud.domain.user.dto.UserResponseDTO;
import com.apiestoque.crud.domain.user.dto.UserStatusUpdateDTO;
import com.apiestoque.crud.infra.response.ApiResponse;
import com.apiestoque.crud.infra.response.ApiResult;
import com.apiestoque.crud.services.UserService;

import jakarta.validation.Valid;

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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponseDTO("Falha na autenticação: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-face")
    public ResponseEntity<Map<String, Object>> verifyFace(@RequestBody Map<String, String> payload) {
        try {
            if (payload == null || !payload.containsKey("image") || !payload.containsKey("email")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Payload inválido. Campos 'image' e 'email' são obrigatórios."));
            }

            String image = payload.get("image");
            String email = payload.get("email");

            if (image == null || image.isBlank() || email == null || email.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Imagem ou e-mail não podem ser vazios."));
            }

            Map<String, Object> result = userService.verifyFace(image, email);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erro ao verificar face: " +
                            (e.getMessage() != null ? e.getMessage() : "Erro desconhecido")));
        }
    }

    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse> registerAdmin(@RequestBody RegisterUserDTO data) {
        ApiResult response = userService.registerAdmin(data);
        return ResponseEntity.status(response.getStatus()).body(response.getBody());
    }

    @PostMapping("/register/user")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody RegisterUserDTO data) {
        ApiResult response = userService.registerUser(data);
        return ResponseEntity.status(response.getStatus()).body(response.getBody());
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<LoginResponseDTO> refreshToken(@RequestBody String refreshToken) {
        try {
            String newToken = userService.refreshToken(refreshToken);
            return ResponseEntity.ok(new LoginResponseDTO(newToken));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new LoginResponseDTO("Falha ao renovar o token: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getLoggedUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        UserResponseDTO dto = userService.getLoggedUser(user);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserResponseDTO> updateStatus(
        @PathVariable String id,
        @RequestBody @Valid UserStatusUpdateDTO statusUpdate) {

        UserResponseDTO updated = userService.updateStatus(id, statusUpdate.status());

        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/users/{id}/password")
    public ResponseEntity<UserResponseDTO> updatePassword(
        @PathVariable String id,
        @RequestBody @Valid UpdatePasswordDTO dto) {
    
        UserResponseDTO updated = userService.updatePassword(id, dto.password());

        return ResponseEntity.ok(updated);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> listUsers() {
        List<UserResponseDTO> dtos = userService.listUsers();
        return ResponseEntity.ok(dtos);
    }
}
