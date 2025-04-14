package com.apiestoque.crud.domain.exit.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record ExitRequestDTO(
    @NotNull(message = "Product ID is required")
    String productId,

    @NotNull(message = "Inventory is required")
    String inventoryId,

    @NotNull(message = "Quantity is required")
    Integer quantity,

    LocalDate exitDate,

    ExitStatus exitStatus
) { }
