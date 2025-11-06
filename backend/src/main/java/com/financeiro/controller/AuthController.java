package com.financeiro.controller;

import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private com.financeiro.repository.UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();
        
        String user = credentials.get("username");
        String pass = credentials.get("password");
        
        // Verifica admin padrão
        if (username.equals(user) && password.equals(pass)) {
            var usuario = usuarioRepository.findByUsername(user);
            response.put("success", true);
            response.put("user", user);
            response.put("role", usuario.isPresent() ? usuario.get().getRole().toString() : "ADMIN");
            response.put("pessoaMesada", usuario.isPresent() && usuario.get().getPessoaMesada() != null ? 
                Map.of("id", usuario.get().getPessoaMesada().getId(), "nome", usuario.get().getPessoaMesada().getNome()) : null);
            return ResponseEntity.ok(response);
        }
        
        // Verifica usuários do banco
        var usuarioOpt = usuarioRepository.findByUsername(user);
        if (usuarioOpt.isPresent()) {
            var usuario = usuarioOpt.get();
            if (usuario.getPassword().equals(pass)) {
                response.put("success", true);
                response.put("user", user);
                response.put("role", usuario.getRole().toString());
                response.put("pessoaMesada", usuario.getPessoaMesada() != null ? 
                    Map.of("id", usuario.getPessoaMesada().getId(), "nome", usuario.getPessoaMesada().getNome()) : null);
                return ResponseEntity.ok(response);
            }
        }
        
        response.put("success", false);
        response.put("message", "Usuário ou senha inválidos");
        return ResponseEntity.status(401).body(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Alteração de senha não implementada. Altere no arquivo application.yml");
        return ResponseEntity.status(501).body(response);
    }
}
