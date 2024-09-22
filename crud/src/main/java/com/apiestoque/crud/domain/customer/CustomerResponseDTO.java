package com.apiestoque.crud.domain.customer;

import java.time.LocalDateTime;
import java.util.Date;

public record CustomerResponseDTO(
        String id,
        String fullname,
        String email,
        String phone,
        String cpf,
        String cep,
        String notes,
        String preferredPaymentMethod,
        String communicationPreference,
        boolean isDefaultCustomer,
        LocalDateTime lastOrderDate,
        CustomerStatus customerStatus,
        Date createdAt
    ) {
    public CustomerResponseDTO(Customer customer) {
        this(
                customer.getId(),
                customer.getFullname(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getCpf(),
                customer.getCep(),
                customer.getNotes(),
                customer.getPreferredPaymentMethod(),
                customer.getCommunicationPreference(),
                customer.isDefaultCustomer(),
                customer.getLastOrderDate(),
                customer.getStatus(),
                customer.getCreatedAt()
            );
    }
}
