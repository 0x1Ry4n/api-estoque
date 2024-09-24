package com.apiestoque.crud.domain.product.dto;

import java.math.BigDecimal;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import com.apiestoque.crud.domain.product.Product;

public record ProductResponseDTO(
    String id,
    String name,
    String description,
    BigDecimal price,
    BigDecimal discount,
    Integer stockQuantity,
    LocalDate expirationDate,
    String categoryId,
    List<String> supplierIds,  
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
            product.getCategory() != null ? product.getCategory().getId() : null,
            product.getSuppliers().stream()  
                .map(supplier -> supplier.getId())
                .collect(Collectors.toList()),
            product.getCreatedAt()
        );
    }
}
