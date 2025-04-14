package com.apiestoque.crud.domain.user.dto;

import jakarta.validation.constraints.NotNull;

public record UserStatusUpdateDTO(
    @NotNull UserStatus status
) {}
