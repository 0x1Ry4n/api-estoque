package com.apiestoque.crud.domain.product.dto;

import java.time.LocalDate;
import java.math.BigDecimal;

public record ProductUpdateDTO(
    String name,
    String description,
    String productCode,
    BigDecimal price,
    LocalDate expirationDate,
    String categoryId
) { }
