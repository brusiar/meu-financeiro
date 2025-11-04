package com.financeiro.controller;

import com.financeiro.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        try {
            if (usuarioService.autenticar(username, password)) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Login realizado com sucesso",
                    "user", username
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Erro interno"
            ));
        }
        
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "message", "Credenciais inválidas"
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData) {
        String username = passwordData.get("username");
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");
        
        try {
            if (usuarioService.alterarSenha(username, currentPassword, newPassword)) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Senha alterada com sucesso"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Erro interno"
            ));
        }
        
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "message", "Senha atual incorreta"
        ));
    }
}