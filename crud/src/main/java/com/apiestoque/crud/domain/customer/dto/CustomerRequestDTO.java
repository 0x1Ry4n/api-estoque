package com.apiestoque.crud.domain.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerRequestDTO(

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    String fullname,

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    String email,

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Phone number is invalid")
    String phone,

    @NotBlank(message = "CPF is required")
    @Pattern(regexp = "^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{11})$", message = "CPF must be in the format XXX.XXX.XXX-XX or a sequence of 11 digits")
    String cpf,

    @NotBlank(message = "CEP is required")
    @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "CEP must be in the format XXXXX-XXX")
    String cep,

    String notes,

    CustomerPreferredPaymentMethod preferredPaymentMethod,

    CustomerCommunicationPreference communicationPreference,

    boolean isDefaultCustomer
) {}
