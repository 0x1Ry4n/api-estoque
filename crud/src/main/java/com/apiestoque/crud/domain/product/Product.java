package com.apiestoque.crud.domain.product;

import com.apiestoque.crud.domain.product.category.Category;
import com.apiestoque.crud.domain.supplier.Supplier;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Date;
import java.math.BigDecimal;


@Entity(name = "products")
@Table(name = "products")
@Setter
@Getter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 5, scale = 2)
    private BigDecimal discount;

    @Column(nullable = false)
    private Integer stockQuantity;

    private LocalDate expirationDate;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "supplier_id") 
    private Supplier supplier;
    
    @Column(nullable = false)
    private Boolean purchasedSeparately = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onPrePersist() {
        this.createdAt = new Date(); 
    }

    public Product(
        String name, 
        String description, 
        BigDecimal price, 
        BigDecimal discount, 
        Integer stockQuantity, 
        LocalDate expirationDate,
        Category category,
        Supplier supplier,
        Boolean purchasedSeparately 
    ) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.discount = discount;
        this.stockQuantity = stockQuantity;
        this.expirationDate = expirationDate;
        this.category = category;
        this.supplier = supplier;
        this.purchasedSeparately = purchasedSeparately;
    }
}
