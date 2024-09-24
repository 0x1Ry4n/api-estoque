package com.apiestoque.crud.domain.customer;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import com.apiestoque.crud.domain.customer.dto.CustomerCommunicationPreference;
import com.apiestoque.crud.domain.customer.dto.CustomerPreferredPaymentMethod;
import com.apiestoque.crud.domain.customer.dto.CustomerStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;

@Entity(name = "customer")
@Table(name = "customer")
@Setter
@Getter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String fullname;
    
    @Column(unique = true)
    private String email;
    
    private String phone;

    @Column(unique = true)              
    private String cpf;
    
    private String cep;
    private String notes;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_payment_ethod")
    private CustomerPreferredPaymentMethod preferredPaymentMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "communication_preference")
    private CustomerCommunicationPreference communicationPreference;
    private LocalDateTime lastOrderDate;

    @Column(name = "is_default_customer", nullable = false)
    private boolean defaultCustomer;

    @Column(name = "status")
    private CustomerStatus status;

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

    public Customer(
            String fullname,
            String email,
            String phone,
            String cpf,
            String cep,
            String notes,
            CustomerPreferredPaymentMethod preferredPaymentMethod,
            CustomerCommunicationPreference communicationPreference,
            LocalDateTime lastOrderDate,
            boolean defaultCustomer,
            CustomerStatus status) {
        this.fullname = fullname;
        this.email = email;
        this.phone = phone;
        this.cpf = cpf;
        this.cep = cep;
        this.notes = notes;
        this.preferredPaymentMethod = preferredPaymentMethod;
        this.communicationPreference = communicationPreference;
        this.lastOrderDate = lastOrderDate;
        this.defaultCustomer = defaultCustomer;
        this.status = status;
    }
}
