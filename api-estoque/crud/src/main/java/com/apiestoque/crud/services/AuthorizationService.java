package com.apiestoque.crud.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.apiestoque.crud.domain.user.User;
import com.apiestoque.crud.repositories.UserRepository;

@Service
public class AuthorizationService implements UserDetailsService {
    
    @Autowired
    UserRepository userRepository;

    @Override 
    public UserDetails loadUserByUsername(String email) {
        User user = userRepository.findUserByEmail(email);
        
        if (user == null) {
            throw new UsernameNotFoundException("Usuário não encontrado com o email: " + email);
        }

        return userRepository.findByEmail(email);
    }
}
