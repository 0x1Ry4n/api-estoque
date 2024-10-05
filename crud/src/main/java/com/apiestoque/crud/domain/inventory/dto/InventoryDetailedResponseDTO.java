package com.apiestoque.crud.domain.inventory.dto;

import java.math.BigDecimal;
import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.product.dto.ProductDetailedResponseDTO;

public record InventoryDetailedResponseDTO(
    ProductDetailedResponseDTO product,
    Integer originalQuantity,
    Integer quantity,
    BigDecimal discount, 
    String location
) {
    public InventoryDetailedResponseDTO(Inventory inventory) {
        this(
            new ProductDetailedResponseDTO(inventory.getProduct()),
            inventory.getOriginalQuantity(),
            inventory.getQuantity(),
            inventory.getDiscount(),
            inventory.getLocation()
        );
    }
}
