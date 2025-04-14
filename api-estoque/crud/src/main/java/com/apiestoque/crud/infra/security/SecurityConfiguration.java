package com.apiestoque.crud.infra.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.Filter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    @Autowired
    CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Autowired
    SecurityFilter securityFilter;

    @Autowired
    CorsConfigurationImpl corsConfigurationImpl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationImpl.corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST,  "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST,  "/api/auth/refresh-token").permitAll()
                        .requestMatchers(HttpMethod.GET,   "/api-docs").permitAll()
                        .requestMatchers(HttpMethod.POST,  "/api/auth/verify-face").permitAll()
                        
                        .requestMatchers(HttpMethod.POST,  "/api/auth/register/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,  "/api/auth/register/user").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,   "/api/auth/users").hasRole("ADMIN")
                        
                        .requestMatchers(HttpMethod.POST,   "/api/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/products/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/*/inventory").permitAll()


                        .requestMatchers(HttpMethod.POST,   "/api/category").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/category/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/category/*").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST,   "/api/supplier").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/supplier/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/supplier/*").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PATCH,  "/api/customer/*/status").hasRole("ADMIN")
                        
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                    .authenticationEntryPoint(customAuthenticationEntryPoint)
                )
                .addFilterBefore((Filter) securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
