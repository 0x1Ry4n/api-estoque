package com.apiestoque.crud.domain.customer;

public record CustomerRequestDTO(
        String fullname,
        String email,
        String phone,
        String cpf,
        String cep,
        String notes,
        String preferredPaymentMethod,
        String communicationPreference,
        boolean isDefaultCustomer) {
}
