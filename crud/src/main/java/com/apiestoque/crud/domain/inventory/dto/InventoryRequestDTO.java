package com.apiestoque.crud.domain.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record InventoryRequestDTO(
    @NotNull(message = "Stock quantity is required")
    @Positive(message = "Stock quantity must be greater than 0")
    Integer quantity,

    @DecimalMin(value = "0.0", inclusive = true, message = "Discount must be greater than or equal to 0")
    BigDecimal discount,

    @NotBlank(message = "Location is required")
    String location
) {}
