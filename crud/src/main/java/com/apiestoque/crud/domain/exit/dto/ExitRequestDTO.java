package com.apiestoque.crud.domain.exit.dto;

import jakarta.validation.constraints.NotNull;

public record ExitRequestDTO(
    @NotNull(message = "Product ID is required")
    String productId,

    @NotNull(message = "Inventory is required")
    String inventoryId,

    @NotNull(message = "Quantity is required")
    Integer quantity,


    @NotNull(message = "Exit status is required")
    ExitStatus exitStatus
) { }
