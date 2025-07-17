package com.apiestoque.crud.services;


import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.apiestoque.crud.domain.customer.Customer;
import com.apiestoque.crud.domain.customer.dto.CustomerRequestDTO;
import com.apiestoque.crud.domain.customer.dto.CustomerResponseDTO;
import com.apiestoque.crud.domain.customer.dto.CustomerStatus;
import com.apiestoque.crud.repositories.CustomerRepository;

import jakarta.transaction.Transactional;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    public CustomerResponseDTO create(CustomerRequestDTO data) {
        if (customerRepository.existsByEmail(data.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente com este e-mail já existe.");
        }

        if (customerRepository.existsByPhone(data.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente com este telefone já existe.");
        }

        if (customerRepository.existsByMobile(data.mobile())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente com este telefone celular já existe.");
        }

        Customer newCustomer = new Customer(
                data.name(),
                data.document(),
                data.ie(),
                data.im(),
                data.email(),
                data.phone(),
                data.mobile(),
                data.address(),
                data.number(),
                data.complement(),
                data.neighborhood(),
                data.city(),
                data.state(),
                data.zipCode(),
                data.status());

        Customer savedCustomer = customerRepository.save(newCustomer);

        return new CustomerResponseDTO(savedCustomer);
    }

    public CustomerResponseDTO update(String id, CustomerRequestDTO data) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));

        if (data.email() != null && !customer.getEmail().equals(data.email())
                && customerRepository.existsByEmail(data.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente com este e-mail já existe.");
        }

        if (data.mobile() != null && !customer.getMobile().equals(data.mobile())
                && customerRepository.existsByMobile(data.mobile())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente com este telefone celular já existe.");
        }

        if (data.phone() != null && !customer.getPhone().equals(data.phone())
                && customerRepository.existsByPhone(data.phone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente com este telefone já existe.");
        }

        if (data.name() != null) customer.setName(data.name());
        if (data.document() != null) customer.setDocument(data.document());
        if (data.ie() != null) customer.setIe(data.ie());
        if (data.im() != null) customer.setIm(data.im());
        if (data.address() != null) customer.setAddress(data.address());
        if (data.number() != null) customer.setNumber(data.number());
        if (data.complement() != null) customer.setComplement(data.complement());
        if (data.neighborhood() != null) customer.setNeighborhood(data.neighborhood());
        if (data.city() != null) customer.setCity(data.city());
        if (data.state() != null) customer.setState(data.city());
        if (data.zipCode() != null) customer.setState(data.zipCode());
        if (data.status() != null) customer.setStatus(data.status());

        Customer updatedCustomer = customerRepository.save(customer);

        return new CustomerResponseDTO(updatedCustomer);
    }

    public Page<CustomerResponseDTO> getAll(Pageable pageable) {
        return customerRepository.findAll(pageable)
            .map(CustomerResponseDTO::new);
    }

    public List<CustomerResponseDTO> getAll() {
        return customerRepository.findAll()
            .stream()
            .map(CustomerResponseDTO::new)
            .collect(Collectors.toList()); 
    }

    public CustomerResponseDTO getById(String id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));

        return new CustomerResponseDTO(customer);
    }

    @Transactional
    public CustomerResponseDTO updateStatus(String id, CustomerStatus status) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));

        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O status não pode ser nulo.");
        }

        customerRepository.UpdateCustomerStatus(customer.getId(), status.name());

        return new CustomerResponseDTO(customer);
    }
}