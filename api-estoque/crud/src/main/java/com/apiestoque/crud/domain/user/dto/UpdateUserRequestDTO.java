package com.apiestoque.crud.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequestDTO(
    @NotBlank(message = "Username is required")
    String username, 

    @Email(message = "Invalid email format")
    @Size(max = 50)
    String email
) {}
