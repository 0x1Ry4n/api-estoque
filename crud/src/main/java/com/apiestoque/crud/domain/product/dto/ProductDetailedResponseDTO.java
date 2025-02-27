package com.apiestoque.crud.domain.product.dto;

import com.apiestoque.crud.domain.inventory.dto.InventoryResponseDTO;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.product.category.dto.CategoryResponseDTO;
import com.apiestoque.crud.domain.supplier.dto.SupplierResponseDTO;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;
import java.math.BigDecimal;

public record ProductDetailedResponseDTO(
    String id,
    String name,
    String description,
    String productCode,
    Integer stockQuantity,
    BigDecimal unitPrice,
    LocalDate expirationDate,
    CategoryResponseDTO category,
    Set<InventoryResponseDTO> inventory, 
    Set<SupplierResponseDTO> suppliers 
) {
    public ProductDetailedResponseDTO(Product product) {
        this(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getProductCode(),
            product.getStockQuantity(),
            product.getUnitPrice(),
            product.getExpirationDate(),
            product.getCategory() != null ? new CategoryResponseDTO(product.getCategory()) : null,
            product.getInventories() != null ? product.getInventories().stream()
                .map(InventoryResponseDTO::new) 
                .collect(Collectors.toSet()) : Set.of(),
            product.getSuppliers() != null ? product.getSuppliers().stream()
                .map(SupplierResponseDTO::new) 
                .collect(Collectors.toSet()) : Set.of() 
        );
    }
}
