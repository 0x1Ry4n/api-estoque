package com.apiestoque.crud.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record PasswordUpdateDTO(
    @NotBlank(message = "A senha não pode estar vazia!")
    @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres.")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        message = "A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial."
    )
    String password
) {}
