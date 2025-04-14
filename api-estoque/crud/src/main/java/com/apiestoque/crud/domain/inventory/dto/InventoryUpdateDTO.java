package com.apiestoque.crud.domain.inventory.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Positive;

public record InventoryUpdateDTO(
    @Positive(message = "Stock quantity must be greater than 0")
    Integer quantity,

    String inventoryCode, 

    @Positive(message = "Discount must be greater than 0")
    BigDecimal discount
) { }