package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apiestoque.crud.domain.customer.Customer;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, String> {
    List<Customer> findByFullname(String fullname);
    List<Customer> findByCep(String cep);   
    Customer findByEmail(String email);   
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByCpf(String cpf);
}