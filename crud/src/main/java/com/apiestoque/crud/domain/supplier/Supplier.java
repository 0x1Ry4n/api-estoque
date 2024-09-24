package com.apiestoque.crud.domain.supplier;

import com.apiestoque.crud.domain.product.Product;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
import java.util.Set;

@Entity(name = "suppliers")
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

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

    @JsonIgnore 
    @ManyToMany(mappedBy = "suppliers")
    private Set<Product> products;

    public Supplier(String name, String email, String phone) {
        this.name = name;
        this.email = email;
        this.phone = phone;
    }
}
