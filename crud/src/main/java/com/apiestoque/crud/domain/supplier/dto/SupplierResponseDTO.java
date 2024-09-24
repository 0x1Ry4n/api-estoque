package com.apiestoque.crud.domain.supplier.dto;

import java.util.Date;

import com.apiestoque.crud.domain.supplier.Supplier;

public record SupplierResponseDTO(
    String id,
    String name,
    String email,
    String phone, 
    Date createdAt
) {
    public SupplierResponseDTO(Supplier supplier) {
        this(
            supplier.getId(),
            supplier.getName(), 
            supplier.getEmail(),
            supplier.getPhone(), 
            supplier.getCreatedAt()
        );
    }
}
