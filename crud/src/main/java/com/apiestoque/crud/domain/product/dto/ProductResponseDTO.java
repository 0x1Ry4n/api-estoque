package com.apiestoque.crud.domain.product.dto;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

import com.apiestoque.crud.domain.product.Product;

public record ProductResponseDTO(
    String id,
    String name,
    String description,
    String productCode,
    Integer stockQuantity,
    BigDecimal unitPrice,
    LocalDate expirationDate,
    String categoryId,
    String categoryName,
    List<String> inventoryIds,
    List<String> supplierIds,
    List<String> supplierNames,
    Date createdAt
) {
    public ProductResponseDTO(Product product) {
        this(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getProductCode(),
            product.getStockQuantity(),
            product.getUnitPrice(),
            product.getExpirationDate(),
            product.getCategory() != null ? product.getCategory().getId() : null,
            product.getCategory() != null ? product.getCategory().getName() : null,
            product.getInventories() != null ? 
                product.getInventories().stream()
                    .map(inventory -> inventory.getId())
                    .collect(Collectors.toList()) : null,  
            product.getSuppliers() != null ? 
                product.getSuppliers().stream()
                    .map(supplier -> supplier.getId())
                    .collect(Collectors.toList()) : null,  
            product.getSuppliers() != null ? 
                product.getSuppliers().stream()
                    .map(supplier -> supplier.getSocialReason())
                    .collect(Collectors.toList()) : null,  
            product.getCreatedAt()
        );
    }
}
