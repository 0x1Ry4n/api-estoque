package com.apiestoque.crud.domain.product.category;

import java.util.Date;


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
