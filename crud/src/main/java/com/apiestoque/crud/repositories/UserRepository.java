package com.apiestoque.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import com.apiestoque.crud.domain.user.User;


public interface UserRepository extends JpaRepository<User, String> {
    UserDetails findByEmail(String email);
    User findByUsername(String username);
}