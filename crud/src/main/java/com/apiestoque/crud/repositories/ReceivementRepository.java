package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.apiestoque.crud.domain.receivement.Receivement;

public interface ReceivementRepository extends JpaRepository<Receivement, String> {
    boolean existsByInventoryCode(String inventoryId);
}
