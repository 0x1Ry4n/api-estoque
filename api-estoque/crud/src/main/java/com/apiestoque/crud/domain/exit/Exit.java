package com.apiestoque.crud.domain.exit;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import com.apiestoque.crud.domain.exit.dto.ExitStatus;
import com.apiestoque.crud.domain.product.Product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;

@Entity(name = "exits")
@Table(name = "exits")
@Setter
@Getter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Exit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "inventory_code", nullable = false)
    private String inventoryCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "exit_status")
    private ExitStatus status;

    @CreatedBy
    private String createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private Date createdAt;

    @Column(nullable = false)
    private LocalDate exitDate;

    @LastModifiedBy
    private String lastModifiedBy;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Date updatedAt;

    @PrePersist
    public void onPrePersist() {
        this.exitDate = LocalDate.now();
        this.createdAt = new Date();
    }

    public Exit(Product product, Integer quantity, String inventoryCode, ExitStatus status) {
        this.product = product;
        this.quantity = quantity;
        this.inventoryCode = inventoryCode;
        this.status = status;
    }
}
