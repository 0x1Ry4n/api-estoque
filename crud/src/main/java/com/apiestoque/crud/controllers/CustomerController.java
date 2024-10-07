package com.apiestoque.crud.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.apiestoque.crud.domain.customer.Customer;
import com.apiestoque.crud.domain.customer.dto.CustomerRequestDTO;
import com.apiestoque.crud.domain.customer.dto.CustomerResponseDTO;
import com.apiestoque.crud.domain.customer.dto.CustomerStatus;
import com.apiestoque.crud.domain.customer.dto.CustomerUpdateStatusRequestDTO;
import com.apiestoque.crud.repositories.CustomerRepository;



import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {
    @Autowired
    private CustomerRepository customerRepository;

    @PostMapping
    public ResponseEntity<CustomerResponseDTO> createCustomer(@RequestBody @Validated CustomerRequestDTO data) {
        boolean isDefaultCustomer = data.isDefaultCustomer();
    
        if (data.email() != null && customerRepository.existsByEmail(data.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail já existe.");
        }
    
        if (data.phone() != null && customerRepository.existsByPhone(data.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefone já existe.");
        }
    
        if (data.cpf() != null && data.cpf() != null && customerRepository.existsByCpf(data.cpf())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF já existe.");
        }
    
        Customer newCustomer = new Customer(
                isDefaultCustomer ? null : data.fullname(),
                isDefaultCustomer ? null : data.email(),
                isDefaultCustomer ? null : data.phone(),
                isDefaultCustomer ? null : data.cpf(),
                isDefaultCustomer ? null : data.cep(),
                isDefaultCustomer ? null : data.notes(),
                isDefaultCustomer ? null : data.preferredPaymentMethod(),
                isDefaultCustomer ? null : data.communicationPreference(),
                null,
                isDefaultCustomer,
                CustomerStatus.ACTIVE);
    
        Customer savedCustomer = this.customerRepository.save(newCustomer);
        return ResponseEntity.status(201).body(new CustomerResponseDTO(savedCustomer));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> updateCustomer(@PathVariable String id,
            @RequestBody @Validated CustomerRequestDTO data) {
        Optional<Customer> optionalCustomer = customerRepository.findById(id);

        if (optionalCustomer.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado.");
        }

        Customer customer = optionalCustomer.get();

        if (data.email() != null && !data.email().equals(customer.getEmail())
                && customerRepository.existsByEmail(data.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail já existe.");
        }

        if (data.phone() != null && !data.phone().equals(customer.getPhone())
                && customerRepository.existsByPhone(data.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefone já existe.");
        }

        if (data.fullname() != null) {
            customer.setFullname(data.fullname());
        }

        if (data.email() != null) {
            customer.setEmail(data.email());
        }

        if (data.phone() != null) {
            customer.setPhone(data.phone());
        }

        if (data.cpf() != null) {
            customer.setCpf(data.cpf());
        }

        if (data.cep() != null) {
            customer.setCep(data.cep());
        }

        if (data.notes() != null) {
            customer.setNotes(data.notes());
        }

        if (data.preferredPaymentMethod() != null) {
            customer.setPreferredPaymentMethod(data.preferredPaymentMethod());
        }

        if (data.communicationPreference() != null) {
            customer.setCommunicationPreference(data.communicationPreference());
        }

        if (!data.isDefaultCustomer()) {
            customer.setDefaultCustomer(false);
        }

        Customer updatedCustomer = customerRepository.save(customer);
        return ResponseEntity.ok(new CustomerResponseDTO(updatedCustomer));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CustomerResponseDTO> updateCustomerStatus(@PathVariable String id,
            @RequestBody CustomerUpdateStatusRequestDTO newStatus) {
        Optional<Customer> optionalCustomer = customerRepository.findById(id);

        if (optionalCustomer.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado.");
        }

        Customer customer = optionalCustomer.get();

        customer.setStatus(newStatus.status());

        Customer updatedCustomer = customerRepository.save(customer);
        return ResponseEntity.ok(new CustomerResponseDTO(updatedCustomer));
    }

    @GetMapping
    public ResponseEntity<Page<CustomerResponseDTO>> getAllCustomers(Pageable pageable) {
        Page<CustomerResponseDTO> customerPage = customerRepository.findAll(pageable)
                .map(CustomerResponseDTO::new);
        return ResponseEntity.ok(customerPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> getCustomerById(@PathVariable String id) {
        Optional<Customer> customer = customerRepository.findById(id);

        if (customer.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado.");
        }

        return ResponseEntity.ok(new CustomerResponseDTO(customer.get()));
    }

    @GetMapping("/fullname/{fullname}")
    public ResponseEntity<List<CustomerResponseDTO>> getCustomerByFullname(@PathVariable String fullname) {
        List<Customer> customers = customerRepository.findByFullname(fullname);

        List<CustomerResponseDTO> customerList = customers.stream()
                .map(CustomerResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(customerList.isEmpty() ? List.of() : customerList);
    }

    @GetMapping("/cep/{cep}")
    public ResponseEntity<List<CustomerResponseDTO>> getCustomerByCep(@PathVariable String cep) {
        List<Customer> customers = customerRepository.findByCep(cep);

        List<CustomerResponseDTO> customerList = customers.stream()
                .map(CustomerResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(customerList.isEmpty() ? List.of() : customerList);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<CustomerResponseDTO> getCustomerByEmail(@PathVariable String email) {
        Optional<Customer> customer = Optional.of(customerRepository.findByEmail(email));

        if (customer.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado.");
        }

        return ResponseEntity.ok(new CustomerResponseDTO(customer.get()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> deleteProductById(@PathVariable String id) {
        customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        this.customerRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}