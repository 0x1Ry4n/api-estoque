package com.apiestoque.crud.domain.product.dto;

import java.time.LocalDate;
import java.util.Set;
import java.math.BigDecimal;

public record ProductUpdateDTO(
    String name,
    String description,
    String productCode,
    BigDecimal price,
    Set<String> supplierIds,
    LocalDate expirationDate,
    String categoryId
) { }
