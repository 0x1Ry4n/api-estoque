package com.apiestoque.crud.domain.inventory;

import com.apiestoque.crud.domain.product.Product;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.util.Date;
import java.time.LocalDateTime;

@Entity(name = "inventory")
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer originalQuantity;

    @Column(nullable = false)
    private Integer quantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal discount;

    private String location;  

    @CreatedBy
    private String createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @LastModifiedBy
    private String lastModifiedBy;

    @PrePersist
    public void onPrePersist() {
        this.createdAt = new Date();
        this.originalQuantity = this.quantity;
    }

    public Inventory(Product product, Integer quantity, BigDecimal discount, String location) {
        this.product = product;
        this.quantity = quantity;
        this.discount = discount;
        this.location = location;
    }
}
