package com.apiestoque.crud.domain.inventory;

import com.apiestoque.crud.domain.exit.Exit;
import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.receivement.Receivement;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.util.Date;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @ManyToMany(cascade = CascadeType.PERSIST)
    @JoinTable(
        name = "inventory_receivements",
        joinColumns = @JoinColumn(name = "inventory_id"),
        inverseJoinColumns = @JoinColumn(name = "receivement_id")
    )
    private List<Receivement> receivements = new ArrayList<>();

    @ManyToMany(cascade = CascadeType.PERSIST)
    @JoinTable(
        name = "inventory_exits",
        joinColumns = @JoinColumn(name = "inventory_id"),
        inverseJoinColumns = @JoinColumn(name = "exit_id")
    )
    private List<Exit> exits = new ArrayList<>();

    @Column(nullable = false)
    private Integer quantity = 0;


    @Column(nullable = false)
    private BigDecimal discount = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private Integer receivementQuantity = 0;

    @Column(nullable = false)
    private Integer exitQuantity = 0;

    @Column(name = "inventory_code", nullable = false, unique = true)
    private String inventoryCode;

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

    public Inventory(Product product, BigDecimal discount, String inventoryCode) {
        this.product = product;
        this.discount = discount;
        this.inventoryCode = inventoryCode;
    }

    public void addReceivement(Receivement receivement) {
        this.receivements.add(receivement);
        this.receivementQuantity += receivement.getQuantity();
        this.quantity += receivement.getQuantity();
    }

    public void addExit(Exit exit) {
        this.exits.add(exit);
        this.exitQuantity += exit.getQuantity();
        this.quantity -= exit.getQuantity();
    }
}
