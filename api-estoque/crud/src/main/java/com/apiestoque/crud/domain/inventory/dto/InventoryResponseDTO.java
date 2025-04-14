package com.apiestoque.crud.domain.inventory.dto;

import java.math.BigDecimal;

import com.apiestoque.crud.domain.inventory.Inventory;

public record InventoryResponseDTO(
    String id,
    String productId,
    String productName,
    Integer quantity,
    Integer receivementQuantity,
    Integer exitQuantity,
    BigDecimal discount,
    BigDecimal unitPrice,
    String inventoryCode
) {
    public InventoryResponseDTO(Inventory inventory) {
        this(
            inventory.getId(),
            inventory.getProduct().getId(), 
            inventory.getProduct().getName(),
            inventory.getQuantity(),
            inventory.getReceivementQuantity(),
            inventory.getExitQuantity(),
            inventory.getDiscount(),
            inventory.getProduct().getUnitPrice(),
            inventory.getInventoryCode()
        );
    }
}
