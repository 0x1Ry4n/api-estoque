package com.apiestoque.crud.domain.inventory.dto;

import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.product.dto.ProductDetailedResponseDTO;

public record InventoryDetailedResponseDTO(
    ProductDetailedResponseDTO product,
    Integer quantity,
    Integer receivementQuantity,
    Integer exitQuantity,
    String inventoryCode
) {
    public InventoryDetailedResponseDTO(Inventory inventory) {
        this(
            new ProductDetailedResponseDTO(inventory.getProduct()),
            inventory.getQuantity(),
            inventory.getReceivementQuantity(),
            inventory.getExitQuantity(),
            inventory.getInventoryCode()
        );
    }
}
