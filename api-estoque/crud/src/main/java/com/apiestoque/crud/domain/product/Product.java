package com.apiestoque.crud.domain.product;

import com.apiestoque.crud.domain.inventory.Inventory;
import com.apiestoque.crud.domain.product.category.Category;
import com.apiestoque.crud.domain.supplier.Supplier;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Date;
import java.math.BigDecimal;
import java.util.Set;

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

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String productCode;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice; 

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToMany
    @JoinTable(name = "product_supplier", joinColumns = @JoinColumn(name = "product_id"), inverseJoinColumns = @JoinColumn(name = "supplier_id"))
    private Set<Supplier> suppliers;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private Set<Inventory> inventories;

    private LocalDate expirationDate;

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
    }

    public Product(String name, String description, String productCode, BigDecimal unitPrice, Category category,
                   Set<Supplier> suppliers, LocalDate expirationDate) {
        this.name = name;
        this.productCode = productCode;
        this.description = description;
        this.unitPrice = unitPrice; 
        this.category = category;
        this.suppliers = suppliers;
        this.expirationDate = expirationDate;
    }
}
