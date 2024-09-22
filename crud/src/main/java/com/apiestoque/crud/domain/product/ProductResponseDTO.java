package com.apiestoque.crud.domain.product;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

public record ProductResponseDTO(
    String id,
    String name,
    String description,
    BigDecimal price,
    BigDecimal discount,
    Integer stockQuantity,
    LocalDate expirationDate,
    String categoryId, 
    String supplierId, 
    Date createdAt
) {
    public ProductResponseDTO(Product product) {
        this(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getDiscount(),
            product.getStockQuantity(),
            product.getExpirationDate(),
            product.getCategory() != null ? product.getCategory().getId() : null ,
            product.getSupplier() != null ? product.getSupplier().getId() : null, 
            product.getCreatedAt()
        );
    }
}
