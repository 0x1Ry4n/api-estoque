package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.apiestoque.crud.domain.exit.Exit;
import java.util.List;

public interface ExitRepository extends JpaRepository<Exit, String>  { 
    List<Exit> findAllByProductId(String productId);
    boolean existsByInventoryCode(String inventoryId);
     
    @Query(value = "EXEC UpdateExitStatus :id, :newStatus", nativeQuery = true)
    void updateExitStatus(String id, String newStatus);
}
