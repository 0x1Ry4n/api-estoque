package com.apiestoque.crud.domain.receivement;

import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.supplier.Supplier;
import com.apiestoque.crud.domain.receivement.dto.ReceivementStatus;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

@Entity(name = "receivings")
@Table(name = "receivings")
@Setter
@Getter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Receivement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name="inventory_code", nullable = false)
    private String inventoryCode;

    private String description;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private LocalDate receivingDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "receiving_status")
    private ReceivementStatus status;

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
        this.createdAt = new Date();
    }

    public Receivement(Product product, Supplier supplier, String inventoryCode, String description, Integer quantity, BigDecimal totalPrice, LocalDate receivingDate, ReceivementStatus status) {
        this.product = product;
        this.supplier = supplier;
        this.inventoryCode = inventoryCode;
        this.description = description;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
        this.receivingDate = receivingDate;
        this.status = status;
    }
}
