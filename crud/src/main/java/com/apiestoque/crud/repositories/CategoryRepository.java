package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.apiestoque.crud.domain.product.category.Category;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByName(String name);
    boolean existsByName(String name);
}
