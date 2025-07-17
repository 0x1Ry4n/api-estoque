package com.apiestoque.crud.domain.customer.dto;

import jakarta.validation.constraints.NotNull;

public record CustomerStatusUpdateDTO(
    @NotNull
    CustomerStatus status
) { }
