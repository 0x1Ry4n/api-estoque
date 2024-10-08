package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.apiestoque.crud.domain.order.Order;
import com.apiestoque.crud.domain.product.Product;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByInventory_Product(Product product);
    List<Order> findByCustomerId(String customerId);
}
