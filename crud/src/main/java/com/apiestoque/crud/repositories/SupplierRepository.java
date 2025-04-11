package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.apiestoque.crud.domain.supplier.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, String> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByCnpj(String cnpj);
}
