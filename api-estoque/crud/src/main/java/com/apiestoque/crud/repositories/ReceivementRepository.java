package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.apiestoque.crud.domain.receivement.Receivement;

public interface ReceivementRepository extends JpaRepository<Receivement, String> {
    boolean existsByInventoryCode(String inventoryId);
    
    @Query(value = "EXEC UpdateReceivementStatus :id, :newStatus", nativeQuery = true)
    void updateReceivementStatus(String id, String newStatus);
}
