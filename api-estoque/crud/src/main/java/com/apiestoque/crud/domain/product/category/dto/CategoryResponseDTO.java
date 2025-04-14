package com.apiestoque.crud.domain.product.category.dto;

import java.util.Date;

import com.apiestoque.crud.domain.product.category.Category;


public record CategoryResponseDTO(
    String id,
    String name, 
    Date createdAt
) {
    public CategoryResponseDTO(Category category) {
        this(
            category.getId(),
            category.getName(), 
            category.getCreatedAt()
        );
    }
}
