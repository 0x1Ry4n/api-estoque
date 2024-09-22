package com.apiestoque.crud.domain.supplier;

public record SupplierRequestDTO(
    String name,
    String email, 
    String phone
) {}
