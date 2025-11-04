package com.financeiro.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Value("${spring.security.user.name}")
    private String username;

    @Value("${spring.security.user.password}")
    private String password;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();
        
        String user = credentials.get("username");
        String pass = credentials.get("password");
        
        if (username.equals(user) && password.equals(pass)) {
            response.put("success", true);
            response.put("user", user);
            return ResponseEntity.ok(response);
        }
        
        response.put("success", false);
        response.put("message", "Usuário ou senha inválidos");
        return ResponseEntity.status(401).body(response);
    }
}
