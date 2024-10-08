package com.apiestoque.crud.domain.inventory.dto;

import java.math.BigDecimal;

import com.apiestoque.crud.domain.inventory.Inventory;

public record InventoryResponseDTO(
    String id,
    String productId,
    String productName,
    Integer originalQuantity,
    Integer quantity,
    BigDecimal unitPrice,
    String location,
    BigDecimal discount 
) {
    public InventoryResponseDTO(Inventory inventory) {
        this(
            inventory.getId(),
            inventory.getProduct().getId(), 
            inventory.getProduct().getName(),
            inventory.getOriginalQuantity(),
            inventory.getQuantity(),
            inventory.getProduct().getUnitPrice(),
            inventory.getLocation(),
            inventory.getDiscount() 
        );
    }
}
