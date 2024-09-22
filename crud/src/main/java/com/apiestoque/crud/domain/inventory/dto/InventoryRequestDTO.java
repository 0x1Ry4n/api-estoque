package com.apiestoque.crud.domain.inventory.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record InventoryRequestDTO(
    @NotNull(message = "Stock quantity is required")
    @Positive(message = "Stock quantity must be greater than 0")
    Integer quantity,

    @NotBlank(message = "Inventory code is required")
    String inventoryCode,

    @NotBlank(message = "Discount is required")
    BigDecimal discount
) {}
