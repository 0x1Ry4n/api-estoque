package com.apiestoque.crud.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import com.apiestoque.crud.repositories.UserRepository;

@Service
public class AuthorizationService implements UserDetailsService {
    
    @Autowired
    UserRepository userRepository;

    @Override 
    public UserDetails loadUserByUsername(String email) {
        return userRepository.findByEmail(email);
    }
}
