package com.apiestoque.crud.domain.supplier;

import com.apiestoque.crud.domain.product.Product;
import com.apiestoque.crud.domain.supplier.dto.SupplierCommunicationPreference;
import com.apiestoque.crud.domain.supplier.dto.SupplierStatus;
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

    @Column(nullable = false, unique = true)
    private String socialReason;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false, unique = true)
    private String cnpj; 

    @Column(nullable = true)
    private String website;

    @Column(nullable = true)
    private String contactPerson; 

    @Column(nullable = true)
    private String cep; 

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SupplierStatus status;

    @Enumerated(EnumType.STRING) 
    @Column(nullable = false)
    private SupplierCommunicationPreference communicationPreference; 

    @JsonIgnore 
    @ManyToMany(mappedBy = "suppliers")
    private Set<Product> products;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Date updatedAt;

    @CreatedBy
    private String createdBy;

    @LastModifiedBy
    private String lastModifiedBy;

    @PrePersist
    public void onPrePersist() {
        this.createdAt = new Date();
    }

    public Supplier(String socialReason, String email, String phone, String cnpj, String website, String contactPerson, String cep, SupplierCommunicationPreference communicationPreference) {
        this.socialReason = socialReason;
        this.email = email;
        this.phone = phone;
        this.cnpj = cnpj;
        this.website = website;
        this.contactPerson = contactPerson;
        this.cep = cep;
        this.communicationPreference = communicationPreference; 
    }
}
