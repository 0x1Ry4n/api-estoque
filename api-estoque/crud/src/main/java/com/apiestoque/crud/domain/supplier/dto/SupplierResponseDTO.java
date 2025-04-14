package com.apiestoque.crud.domain.supplier.dto;

import java.util.Date;

import com.apiestoque.crud.domain.supplier.Supplier;

public record SupplierResponseDTO(
    String id,
    String socialReason,
    String email,
    String contactPerson,
    String phone,
    String cep,
    String cnpj,
    String website, 
    SupplierCommunicationPreference communicationPreference,
    Date createdAt
) {
    public SupplierResponseDTO(Supplier supplier) {
        this(
            supplier.getId(),
            supplier.getSocialReason(), 
            supplier.getEmail(),
            supplier.getContactPerson(),
            supplier.getPhone(), 
            supplier.getCep(),
            supplier.getCnpj(),
            supplier.getWebsite(),
            supplier.getCommunicationPreference(),
            supplier.getCreatedAt()
        );
    }
}
