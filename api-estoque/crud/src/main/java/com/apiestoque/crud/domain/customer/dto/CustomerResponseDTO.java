package com.apiestoque.crud.domain.customer.dto;

import com.apiestoque.crud.domain.customer.Customer;

public record CustomerResponseDTO(
        String id,
        String name,
        String cpf, 
        String cnpj,
        String ie,
        String im,
        String email,
        String phone,
        String mobile,
        String address,
        String number,
        String complement,
        String neighborhood,
        String city,
        String state,
        String zipCode,
        String notes,
        CustomerStatus status
) {
    public CustomerResponseDTO(Customer customer) {
        this(
            customer.getId(),
            customer.getName(),
            customer.getCpf(),
            customer.getCnpj(),
            customer.getIe(),
            customer.getIm(),
            customer.getEmail(),
            customer.getPhone(),
            customer.getMobile(),
            customer.getAddress(),
            customer.getNumber(),
            customer.getComplement(),
            customer.getNeighborhood(),
            customer.getCity(),
            customer.getState(),
            customer.getZipCode(),
            customer.getNotes(),
            customer.getStatus()
        );
    }
}
