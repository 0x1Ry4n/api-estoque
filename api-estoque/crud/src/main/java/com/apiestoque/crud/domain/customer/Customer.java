package com.apiestoque.crud.domain.customer;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import com.apiestoque.crud.domain.customer.dto.CustomerStatus;
import com.apiestoque.crud.domain.order.Order;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity(name = "customers")
@Table(name = "customers")
@Setter
@Getter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 14)
    private String cpf;

    @Column(length = 20)
    private String cnpj;

    @Column(length = 20)
    private String ie;

    @Column(length = 20)
    private String im;

    @Column(length = 50)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 20)
    private String mobile;

    @Column(length = 100)
    private String address;

    @Column(length = 10)
    private String number;

    @Column(length = 50)
    private String complement;

    @Column(length = 50)
    private String neighborhood;

    @Column(length = 50)
    private String city;

    @Column(length = 4)
    private String state;

    @Column(length = 10)
    private String zipCode;

    @Column(length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerStatus status;

    @OneToMany(mappedBy = "customer")
    @JsonIgnore
    private List<Order> orders = new ArrayList<>();

    @CreatedBy
    private String createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false)
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

    public Customer(
            String name,
            String cpf,
            String cnpj,
            String ie,
            String im,
            String email,
            String phone,
            String mobile,
            String address,
            String number,
            String complement,
            String neighborhood,
            String city,
            String state,
            String zipCode,
            String notes,
            CustomerStatus status) {
        this.name = name;
        this.cpf = cpf;
        this.cnpj = cnpj;
        this.ie = ie;
        this.im = im;
        this.email = email;
        this.phone = phone;
        this.mobile = mobile;
        this.address = address;
        this.number = number;
        this.complement = complement;
        this.neighborhood = neighborhood;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.notes = notes;
        this.status = status;
    }
}
