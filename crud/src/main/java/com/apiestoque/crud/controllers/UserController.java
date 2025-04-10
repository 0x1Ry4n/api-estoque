package com.apiestoque.crud.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apiestoque.crud.domain.user.User;
import com.apiestoque.crud.domain.user.dto.AuthenticationDTO;
import com.apiestoque.crud.domain.user.dto.LoginResponseDTO;
import com.apiestoque.crud.domain.user.dto.RefreshTokenRequestDTO;
import com.apiestoque.crud.domain.user.dto.RegisterUserDTO;
import com.apiestoque.crud.domain.user.dto.UserResponseDTO;
import com.apiestoque.crud.domain.user.dto.UserRole;
import com.apiestoque.crud.infra.response.ApiResponse;
import com.apiestoque.crud.infra.security.TokenService;
import com.apiestoque.crud.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.security.core.Authentication;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private TokenService tokenService;

    @SuppressWarnings("rawtypes")
    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Validated AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);
        
        User user = (User) auth.getPrincipal();
        
        if (user.getRole() == UserRole.USER) {
            String key = "face_validation:" + user.getEmail();
            String validation = redisTemplate.opsForValue().get(key);
            
            if (validation == null || !validation.equals("valid")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse("Verificação facial necessária"));
            }
            
            redisTemplate.delete(key);
        }

        var token = tokenService.generateToken((User) auth.getPrincipal());
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/verify-face")
    public ResponseEntity<Map<String, Object>> verifyFace(@RequestBody Map<String, String> payload) {
        try {
            String capturedImage = payload.get("image");
            String email = payload.get("email");

            if (capturedImage == null || capturedImage.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Imagem capturada está vazia ou ausente"));
            }

            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "E-mail ausente"));
            }

            User user = userRepository.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Usuário não encontrado. Insira um e-mail válido"));
            } else if (user.getFaceImage() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)    
                .body(Map.of("error", "Usuário não possuí imagem facial registrada no banco"));
            }

            System.out.println("🔍 Verificando imagem para o usuário: " + email);

            byte[] savedFaceImage = user.getFaceImage();
            String base64SavedImage = Base64.getEncoder().encodeToString(savedFaceImage);

            String jsonBody = String.format("{"
                    + "\"image\":\"%s\","
                    + "\"saved_image\":\"%s\""
                    + "}", capturedImage, base64SavedImage);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:5000/compare-faces"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> result = mapper.readValue(response.body(), Map.class);

            if (Boolean.TRUE.equals(result.get("verified"))) {
                String key = "face_validation:" + email;
                redisTemplate.opsForValue().set(key, "valid", 5, TimeUnit.MINUTES);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
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
        User newUser = new User(data.username(), data.email(), encryptedPassword, data.status(), data.role(), null);

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

        User newUser = new User(data.username(), data.email(), encryptedPassword, data.status(), data.role(), null);

        if (data.faceImage() != null && !data.faceImage().isEmpty()) {
            String base64Data = data.faceImage();
            if (base64Data.startsWith("data:image")) {
                base64Data = base64Data.split(",")[1];
            }
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            newUser.setFaceImage(imageBytes);
        }

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

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getLoggedUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        UserResponseDTO dto = new UserResponseDTO(
            user.getId(),
            user.getUsernameOriginal(), 
            Optional.empty(),
            user.getEmail(),
            user.getRole().toString(),
            user.getStatus().toString(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> listUsers() {
        List<User> users = userRepository.findAll();

        List<UserResponseDTO> dtos = users.stream().map(user -> new UserResponseDTO(
            user.getId(),
            user.getUsernameOriginal(), 
            Optional.ofNullable(user.getPassword()),
            user.getEmail(),
            user.getRole().toString(),
            user.getStatus().toString(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        )).toList();

        return ResponseEntity.ok(dtos);
    }
}
