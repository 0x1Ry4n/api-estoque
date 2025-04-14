package com.apiestoque.crud.domain.supplier.dto;

public record SupplierUpdateRequestDTO(String socialReason, String email, String phone, String website, String contactPerson, String cep) { }
