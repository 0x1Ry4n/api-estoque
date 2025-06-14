package com.apiestoque.crud.services;

import com.apiestoque.crud.domain.user.User;
import com.apiestoque.crud.domain.user.dto.AuthenticationDTO;
import com.apiestoque.crud.domain.user.dto.LoginResponseDTO;
import com.apiestoque.crud.domain.user.dto.RegisterUserDTO;
import com.apiestoque.crud.domain.user.dto.UserResponseDTO;
import com.apiestoque.crud.repositories.UserRepository;
import com.apiestoque.crud.infra.response.ApiResponse;
import com.apiestoque.crud.infra.response.ApiResult;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;

import com.apiestoque.crud.domain.user.dto.UserRole;
import com.apiestoque.crud.domain.user.dto.UserStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

    public LoginResponseDTO authenticateUser(AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());

        var auth = this.authenticationManager.authenticate(usernamePassword);

        User user = (User) auth.getPrincipal();

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new RuntimeException("Esta conta de usuário foi desativada.");
        }

        if (user.getFaceImage() != null && user.getRole() == UserRole.USER) {
            String key = "face_validation:" + user.getEmail();
            String validation = redisTemplate.opsForValue().get(key);

            if (validation == null || !validation.equals("valid")) {
                throw new RuntimeException("Verificação facial necessária.");
            }

            redisTemplate.delete(key);
        }

        var token = tokenService.generateToken(user);
        return new LoginResponseDTO(token);
    }

    @Transactional
    public UserResponseDTO updateStatus(String id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O status não pode ser nulo.");
        }

        userRepository.updateUserStatus(user.getId(), status.name());

        return new UserResponseDTO(user);
    }

    @Transactional
    public UserResponseDTO updatePassword(String id, String password) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        if (password == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha não pode ser nula.");
        }

        String encryptedPassword = passwordEncoder.encode(password);
        user.setPassword(encryptedPassword);

        userRepository.save(user);

        return new UserResponseDTO(user);
    }

    public Map<String, Object> verifyFace(String capturedImage, String email) throws Exception {
        var httpClient = HttpClient.newHttpClient();
        ObjectMapper objectMapper = new ObjectMapper();

        if (capturedImage == null || capturedImage.isBlank()) {
            throw new IllegalArgumentException("A imagem capturada não pode ser nula ou vazia");
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("O e-mail não pode ser nulo ou vazio");
        }

        User user = userRepository.findUserByEmail(email);

        if (user == null) {
            throw new RuntimeException("Usuário não cadastrado");
        }

        if (user.getFaceImage() == null || user.getFaceImage().length == 0) {
            Map<String, Object> response = new HashMap<>();
            response.put("verified", true);
            response.put("distance", 1);
            return response;
        }

        String base64SavedImage;
        try {
            base64SavedImage = Base64.getEncoder().encodeToString(user.getFaceImage());
        } catch (Exception e) {
            throw new RuntimeException("Falha ao codificar imagem do usuário", e);
        }

        String jsonBody;
        try {
            jsonBody = objectMapper.writeValueAsString(Map.of(
                    "image", capturedImage,
                    "saved_image", base64SavedImage));
        } catch (Exception e) {
            throw new RuntimeException("Falha ao criar JSON para requisição", e);
        }

        HttpRequest request;
        HttpResponse<String> response;
        try {
            request = HttpRequest.newBuilder()
                    .uri(URI.create("http://deepface-api:5000/compare-faces"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            throw new RuntimeException("Falha na comunicação com o serviço de reconhecimento facial", e);
        }

        if (response.statusCode() != 200) {
            throw new RuntimeException("Serviço de reconhecimento retornou status: " + response.statusCode());
        }

        Map<String, Object> result;
        try {
            result = objectMapper.readValue(response.body(), Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Resposta inválida do serviço de reconhecimento", e);
        }

        if (!result.containsKey("verified")) {
            throw new RuntimeException("Resposta do serviço não contém campo 'verified'");
        }

        if (Boolean.TRUE.equals(result.get("verified"))) {
            try {
                String key = "face_validation:" + email;
                redisTemplate.opsForValue().set(key, "valid", 5, TimeUnit.MINUTES);
            } catch (Exception e) {
                System.err.println("Erro ao acessar Redis: " + e.getMessage());
            }
        }

        return result;
    }

    public ApiResult registerAdmin(RegisterUserDTO data) {
        if (userRepository.findByUsername("admin") == null) {
            return new ApiResult(new ApiResponse("message", "O Usuário master não existe."), HttpStatus.BAD_REQUEST);
        }

        if (data.role() == null || !data.role().equals(UserRole.ADMIN)) {
            return new ApiResult(
                    new ApiResponse("message", "A regra de administrador é necessária para acessar esse endpoint."),
                    HttpStatus.BAD_REQUEST);
        }

        if (this.userRepository.findByUsername(data.username()) != null) {
            return new ApiResult(new ApiResponse("message", "O Username inserido já existe."), HttpStatus.BAD_REQUEST);
        }

        if (this.userRepository.findByEmail(data.email()) != null) {
            return new ApiResult(new ApiResponse("message", "O Email inserido já existe."), HttpStatus.BAD_REQUEST);
        }

        String encryptedPassword = passwordEncoder.encode(data.password());
        User newUser = new User(data.username(), data.email(), encryptedPassword, data.status(), data.role(), null);

        this.userRepository.save(newUser);

        return new ApiResult(new ApiResponse("message", "Usuário admin registrado com sucesso."), HttpStatus.CREATED);
    }

    public ApiResult registerUser(RegisterUserDTO data) {
        if (userRepository.findByUsername("admin") == null) {
            return new ApiResult(new ApiResponse("message", "O Usuário master não existe."), HttpStatus.BAD_REQUEST);
        }

        if (data.role() == null || !data.role().equals(UserRole.USER)) {
            return new ApiResult(
                    new ApiResponse("message", "A regra de administrador é necessária para acessar esse endpoint."),
                    HttpStatus.BAD_REQUEST);
        }

        if (this.userRepository.findByUsername(data.username()) != null) {
            return new ApiResult(new ApiResponse("message", "O Username inserido já existe."), HttpStatus.BAD_REQUEST);
        }

        if (this.userRepository.findByEmail(data.email()) != null) {
            return new ApiResult(new ApiResponse("message", "O Email inserido já existe."), HttpStatus.BAD_REQUEST);
        }

        String encryptedPassword = passwordEncoder.encode(data.password());
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

        return new ApiResult(new ApiResponse("message", "Usuário registrado com sucesso."), HttpStatus.CREATED);
    }

    public String refreshToken(String refreshToken) {
        if (tokenService.validateToken(refreshToken).equals("")) {
            throw new RuntimeException("Invalid refresh token.");
        }

        String username = tokenService.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }

        return tokenService.generateToken(user);
    }

    public UserResponseDTO getLoggedUser(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getUsernameOriginal(),
                user.getEmail(),
                user.getRole().toString(),
                user.getStatus().toString(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }

    public List<UserResponseDTO> listUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(user -> new UserResponseDTO(
                user.getId(),
                user.getUsernameOriginal(),
                user.getEmail(),
                user.getRole().toString(),
                user.getStatus().toString(),
                user.getCreatedAt(),
                user.getUpdatedAt())).toList();
    }
}
