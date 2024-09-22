package com.apiestoque.crud.domain.supplier.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SupplierRequestDTO(
    @NotBlank(message = "Social reason is required")
    @Size(min = 5, max = 200, message = "Social reason must be between 5 and 200 characters")
    String socialReason,

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    String email,
    
    @NotBlank(message = "CNPJ is required")
    @Pattern(regexp = "\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}", message = "Invalid CNPJ format")
    String cnpj,
    
    @NotBlank(message = "Contact person is required")
    @Size(min = 10, max = 100, message = "Contact person must be between 10 and 100 characters")
    String contactPerson,

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Phone number is invalid")
    String phone, 

    @NotBlank(message = "CEP is required")
    @Pattern(regexp = "^[0-9]{5}-?[0-9]{3}$", message = "Invalid CEP format")
    String cep, 

    @Size(max = 100, message = "Website must be between 0 and 100 characters")
    String website,

    @NotNull(message = "Communication preference is required")
    SupplierCommunicationPreference communicationPreference 
) {}
