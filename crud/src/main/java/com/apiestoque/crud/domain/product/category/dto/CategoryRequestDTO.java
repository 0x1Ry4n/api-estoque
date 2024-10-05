package com.apiestoque.crud.domain.product.category.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequestDTO(
    @NotBlank(message = "Category name is required")
    String name
) {}
