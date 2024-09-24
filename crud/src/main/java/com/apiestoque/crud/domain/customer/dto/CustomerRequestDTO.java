package com.apiestoque.crud.domain.customer.dto;

public record CustomerRequestDTO(
        String fullname,
        String email,
        String phone,
        String cpf,
        String cep,
        String notes,
        CustomerPreferredPaymentMethod preferredPaymentMethod,
        CustomerCommunicationPreference communicationPreference,
        boolean isDefaultCustomer) {
}
