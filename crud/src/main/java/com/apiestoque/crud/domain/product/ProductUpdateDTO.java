package com.apiestoque.crud.domain.product;

import java.time.LocalDate;
import java.math.BigDecimal;

public record ProductUpdateDTO(
    String name,
    String description,
    BigDecimal price,
    BigDecimal discount,
    Integer stockQuantity,
    LocalDate expirationDate,
    String categoryId
) { }
