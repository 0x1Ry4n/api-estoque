package com.apiestoque.crud.domain.inventory.dto;

import java.math.BigDecimal;

public record InventoryUpdateDTO(
    Integer originalQuantity,
    Integer quantity,
    BigDecimal discount,
    String location
) { }