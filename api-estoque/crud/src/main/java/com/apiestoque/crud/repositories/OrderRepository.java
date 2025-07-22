package com.apiestoque.crud.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.apiestoque.crud.domain.order.Order;

public interface OrderRepository extends JpaRepository<Order, String> { 
    Optional<Order> findByOrderNumber(Long orderNumber);
}