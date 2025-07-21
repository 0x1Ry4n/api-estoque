package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.apiestoque.crud.domain.customer.Customer;

public interface CustomerRepository extends JpaRepository<Customer, String> {
    boolean existsByCpf(String cpf);
    boolean existsByCnpj(String cnpj);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByMobile(String mobile);

    @Query(value = "EXEC UpdateCustomerStatus :id, :newStatus", nativeQuery = true)
    void UpdateCustomerStatus(String id, String newStatus);
}
