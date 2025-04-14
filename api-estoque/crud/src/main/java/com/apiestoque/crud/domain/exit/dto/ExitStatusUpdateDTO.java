package com.apiestoque.crud.domain.exit.dto;

import jakarta.validation.constraints.NotNull;

public record ExitStatusUpdateDTO(
    @NotNull
    ExitStatus status
) {}