package com.apiestoque.crud.controllers;

import com.apiestoque.crud.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailController {
    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestParam String to, 
                                             @RequestParam String subject, 
                                             @RequestParam String body) {
        try {
            emailService.sendEmail(to, subject, body);
            return ResponseEntity.ok("Email enviado com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Erro ao enviar email: " + e.getMessage());
        }
    }
}
