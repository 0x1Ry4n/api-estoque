package com.apiestoque.crud.infra;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.apiestoque.crud.domain.user.User;
import com.apiestoque.crud.domain.user.dto.UserRole;
import com.apiestoque.crud.domain.user.dto.UserStatus;
import com.apiestoque.crud.repositories.UserRepository;

import java.util.ArrayList;
import java.util.List;

@Component
public class UserInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        List<User> usersToSave = new ArrayList<>();

        addIfNotExists(usersToSave, "admin", "admin@example.com", "root", UserRole.ADMIN, UserStatus.ACTIVE);
        addIfNotExists(usersToSave, "gerente", "gerente@estoque.com", "gerente123", UserRole.USER, UserStatus.ACTIVE);
        addIfNotExists(usersToSave, "funcionario1", "func1@estoque.com", "func1123", UserRole.USER, UserStatus.ACTIVE);
        addIfNotExists(usersToSave, "funcionario2", "func2@estoque.com", "func2123", UserRole.USER, UserStatus.ACTIVE);
        addIfNotExists(usersToSave, "usuarioinativo", "inativo@estoque.com", "inativo123", UserRole.USER, UserStatus.INACTIVE);

        usersToSave.forEach(userRepository::save);
    }

    private void addIfNotExists(List<User> list, String username, String email, String rawPassword, UserRole role, UserStatus status) {
        if (userRepository.findByUsername(username) == null) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            user.setStatus(status);
            list.add(user);
        }
    }
}
