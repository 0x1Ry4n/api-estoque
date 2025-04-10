package com.apiestoque.crud.domain.user.dto;

import java.util.Date;
import java.time.LocalDateTime;
import java.util.Optional;

public record UserResponseDTO(
    String id,
    String username,
    Optional<String> password,
    String email,
    String role,
    String status,
    Date createdAt,
    LocalDateTime  updatedAt
) {}
    