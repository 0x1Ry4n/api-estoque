package com.apiestoque.crud.domain.product.dto;

import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.product.category.dto.CategoryResponseDTO;
import com.apiestoque.crud.domain.supplier.dto.SupplierResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

public record ProductDetailedResponseDTO(
    String id,
    String name,
    String description,
    BigDecimal price,
    BigDecimal discount,
    Integer stockQuantity,
    LocalDate expirationDate,
    CategoryResponseDTO category,
    List<SupplierResponseDTO> suppliers
) {
    public ProductDetailedResponseDTO(Product product) {
        this(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getDiscount(),
            product.getStockQuantity(),
            product.getExpirationDate(),
            product.getCategory() != null ? new CategoryResponseDTO(product.getCategory()) : null,
            product.getSuppliers().stream()
                .map(SupplierResponseDTO::new)
                .collect(Collectors.toList())
        );
    }
}
