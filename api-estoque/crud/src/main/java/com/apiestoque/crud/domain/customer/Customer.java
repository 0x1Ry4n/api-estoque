package com.apiestoque.crud.domain.customer;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import com.apiestoque.crud.domain.customer.dto.CustomerStatus;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

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

    @Column(length = 20)
    private String document;

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

    @Column(length = 2)
    private String state;

    @Column(length = 10)
    private String zipCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerStatus status;

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
            String document,
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
            CustomerStatus status) {
        this.name = name;
        this.document = document;
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
        this.status = status;
    }
}
