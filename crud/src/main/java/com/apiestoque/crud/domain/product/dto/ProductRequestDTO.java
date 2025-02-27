package com.apiestoque.crud.domain.product.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

public record ProductRequestDTO(
    @NotBlank(message = "Name is required")
    String name,

    @NotBlank(message = "Description is required")
    String description,
    
    @NotBlank(message = "Product code is required")
    String productCode,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    BigDecimal unitPrice,

    @NotBlank(message = "Category ID is required")
    String categoryId,

    
    @NotNull(message = "Suppliers ID is required")
    Set<@NotBlank(message = "Supplier ID cannot be blank") String> suppliersId,
    
    @Future(message = "Expiration date must be in the future")
    LocalDate expirationDate
) {}
