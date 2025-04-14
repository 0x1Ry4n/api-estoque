package com.apiestoque.crud.domain.receivement.dto;

import jakarta.validation.constraints.NotNull;

public record ReceivementStatusUpdateDTO(
    @NotNull
    ReceivementStatus status
) {}