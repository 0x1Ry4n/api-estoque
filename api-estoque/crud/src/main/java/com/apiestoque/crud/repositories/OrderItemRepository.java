package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.apiestoque.crud.domain.order.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, String> {
    
}
