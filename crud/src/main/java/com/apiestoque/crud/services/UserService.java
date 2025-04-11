package com.apiestoque.crud.services;

import com.apiestoque.crud.domain.user.User;
import com.apiestoque.crud.domain.user.dto.AuthenticationDTO;
import com.apiestoque.crud.domain.user.dto.LoginResponseDTO;
import com.apiestoque.crud.domain.user.dto.RegisterUserDTO;
import com.apiestoque.crud.domain.user.dto.UserResponseDTO;
import com.apiestoque.crud.repositories.UserRepository;
import com.apiestoque.crud.infra.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.apiestoque.crud.domain.user.dto.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class UserService {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private TokenService tokenService;

    public LoginResponseDTO authenticateUser(AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        User user = (User) auth.getPrincipal();

        if (user.getRole() == UserRole.USER) {
            String key = "face_validation:" + user.getEmail();
            String validation = redisTemplate.opsForValue().get(key);

            if (validation == null || !validation.equals("valid")) {
                throw new RuntimeException("Verificação facial necessária");
            }

            redisTemplate.delete(key);
        }

        var token = tokenService.generateToken(user);
        return new LoginResponseDTO(token);
    }

    public Map<String, Object> verifyFace(String capturedImage, String email) throws Exception {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new RuntimeException("Usuário não encontrado. Insira um e-mail válido.");
        } else if (user.getFaceImage() == null) {
            throw new RuntimeException("Usuário não possui imagem facial registrada no banco.");
        }

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

        return result;
    }

    public ApiResponse registerAdmin(RegisterUserDTO data) {
        if (userRepository.findByUsername("admin") == null) {
            return new ApiResponse("Master user does not exist.");
        }

        if (data.role() == null || !data.role().equals(UserRole.ADMIN)) {
            return new ApiResponse("A role of admin is required for this endpoint.");
        }

        if (this.userRepository.findByUsername(data.username()) != null) {
            return new ApiResponse("Username já existe.");
        }

        if (this.userRepository.findByEmail(data.email()) != null) {
            return new ApiResponse("Email já existe.");
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());
        User newUser = new User(data.username(), data.email(), encryptedPassword, data.status(), data.role(), null);
        this.userRepository.save(newUser);

        return new ApiResponse("Admin user registered successfully.");
    }

    public ApiResponse registerUser(RegisterUserDTO data) {
        if (userRepository.findByUsername("admin") == null) {
            return new ApiResponse("Master user does not exist.");
        }

        if (data.role() == null || !data.role().equals(UserRole.USER)) {
            return new ApiResponse("A role of user is required for this endpoint.");
        }

        if (this.userRepository.findByUsername(data.username()) != null) {
            return new ApiResponse("Username já existe.");
        }

        if (this.userRepository.findByEmail(data.email()) != null) {
            return new ApiResponse("Email já existe.");
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

        return new ApiResponse("User registered successfully.");
    }

    public String refreshToken(String refreshToken) {
        if (tokenService.validateToken(refreshToken).equals("")) {
            throw new RuntimeException("Invalid refresh token.");
        }

        String username = tokenService.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found.");
        }

        return tokenService.generateToken(user);
    }

    public UserResponseDTO getLoggedUser(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getUsernameOriginal(),
                Optional.empty(),
                user.getEmail(),
                user.getRole().toString(),
                user.getStatus().toString(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public List<UserResponseDTO> listUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(user -> new UserResponseDTO(
                user.getId(),
                user.getUsernameOriginal(),
                Optional.ofNullable(user.getPassword()),
                user.getEmail(),
                user.getRole().toString(),
                user.getStatus().toString(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        )).toList();
    }
}
