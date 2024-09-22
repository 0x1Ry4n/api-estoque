package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.apiestoque.crud.domain.order.Order;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByCustomerId(String customerId);
}
