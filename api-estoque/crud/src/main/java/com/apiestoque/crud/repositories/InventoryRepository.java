package com.apiestoque.crud.repositories;

import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;


public interface InventoryRepository extends JpaRepository<Inventory, String> {
    Optional<Inventory> findByProductId(String productId);
    List<Inventory> findAllByProductId(String productId);
    List<Inventory> findByProduct(Product product);
    Optional<Inventory> findByInventoryCode(String inventoryCode);
    Optional<Inventory> findById(String id);

}
