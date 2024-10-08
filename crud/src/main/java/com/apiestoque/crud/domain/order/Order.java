package com.apiestoque.crud.domain.order;

import com.apiestoque.crud.domain.customer.Customer;
import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.order.dto.OrderPaymentMethod;
import com.apiestoque.crud.domain.order.dto.OrderStatus;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

@Entity(name = "orders")
@Table(name = "orders")
@Setter
@Getter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    
    @ManyToOne
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventory;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "payment_method", nullable = false)
    @Enumerated(EnumType.STRING)
    private OrderPaymentMethod paymentMethod;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    private OrderStatus status;

    @CreatedBy
    private String createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @LastModifiedBy
    private String lastModifiedBy;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Date updatedAt;

    @PrePersist
    public void onPrePersist() {
        this.orderDate = LocalDateTime.now();
        this.createdAt = new Date();
    }

    public Order(Customer customer, Inventory inventory, Integer quantity, BigDecimal totalPrice, OrderPaymentMethod paymentMethod, OrderStatus status) {
        this.customer = customer;
        this.inventory = inventory;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
        this.paymentMethod = paymentMethod;
        this.status = status;
    }
}
