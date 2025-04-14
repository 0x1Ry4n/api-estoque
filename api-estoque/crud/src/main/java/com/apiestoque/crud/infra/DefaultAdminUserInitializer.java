package com.apiestoque.crud.infra;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.apiestoque.crud.domain.user.User;
import com.apiestoque.crud.domain.user.dto.UserRole;
import com.apiestoque.crud.domain.user.dto.UserStatus;
import com.apiestoque.crud.repositories.UserRepository;

@Component
public class DefaultAdminUserInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; 

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("admin") == null) {
            User masterUser = new User("admin", "admin@example.com", 
                passwordEncoder.encode("root"),
                UserStatus.ACTIVE,
                UserRole.ADMIN, 
                null);
            userRepository.save(masterUser);
        }
    }
}
