package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.apiestoque.crud.domain.product.Product;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByCategoryId(String categoryId);
    List<Product> findByName(String name);
    List<Product> findBySuppliersId(String supplierId);
}
