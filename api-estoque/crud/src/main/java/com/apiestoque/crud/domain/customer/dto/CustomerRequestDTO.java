package com.apiestoque.crud.domain.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CustomerRequestDTO(
    @NotBlank(message = "Customer name is required")
    String name,

    @Size(max = 20, message = "Document must be at most 20 characters")
    String document,

    @Size(max = 20)
    String ie,

    @Size(max = 20)
    String im,

    @Email(message = "Invalid email format")
    @Size(max = 50)
    String email,

    @Size(max = 20)
    String phone,

    @Size(max = 20)
    String mobile,

    @Size(max = 100)
    String address,

    @Size(max = 10)
    String number,

    @Size(max = 50)
    String complement,

    @Size(max = 50)
    String neighborhood,

    @Size(max = 50)
    String city,

    @Size(max = 2)
    String state,

    @Size(max = 10)
    String zipCode,

    @NotNull(message = "Status is required")
    CustomerStatus status
) {}
