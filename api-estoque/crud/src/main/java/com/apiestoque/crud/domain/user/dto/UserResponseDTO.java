package com.apiestoque.crud.domain.user.dto;

import java.util.Date;
import java.util.Optional;
import java.time.LocalDateTime;

import com.apiestoque.crud.domain.user.User;

public record UserResponseDTO(
    String id,
    String username,
    Optional<String> password,
    String email,
    String role,
    String status,
    Date createdAt,
    LocalDateTime updatedAt
) {
    public UserResponseDTO(User user) {
        this(
            user.getId(), 
            user.getUsername(), 
            Optional.ofNullable(user.getPassword()),
            user.getEmail(), 
            user.getRole().toString(), 
            user.getStatus().toString(),
            user.getCreatedAt(),
            user.getUpdatedAt() 
        );
    }
}
