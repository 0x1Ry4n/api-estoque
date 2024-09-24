package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apiestoque.crud.domain.supplier.Supplier;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, String> {
    Optional<Supplier> findById(String id);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}
