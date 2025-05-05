package com.apiestoque.crud.domain.user.dto;

import java.util.Date;
import java.time.LocalDateTime;

import com.apiestoque.crud.domain.user.User;

public record UserResponseDTO(
    String id,
    String username,
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
            user.getEmail(), 
            user.getRole().toString(), 
            user.getStatus().toString(),
            user.getCreatedAt(),
            user.getUpdatedAt() 
        );
    }
}
