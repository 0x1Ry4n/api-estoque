package com.apiestoque.crud.domain.product.dto;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.Set;

public record ProductRequestDTO(
    String name,
    String description,
    BigDecimal price,
    BigDecimal discount,
    Integer stockQuantity,
    LocalDate expirationDate,
    String categoryId,
    Set<String> suppliersId
) {}
