package com.financeiro.controller;

import com.financeiro.model.Usuario;
import com.financeiro.repository.PessoaRepository;
import com.financeiro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> listar() {
        try {
            var usuarios = usuarioRepository.findAll().stream()
                .map(u -> {
                    var map = new java.util.HashMap<String, Object>();
                    map.put("id", u.getId());
                    map.put("username", u.getUsername());
                    map.put("email", u.getEmail());
                    map.put("role", u.getRole() != null ? u.getRole().toString() : "USER");
                    map.put("pessoaMesada", u.getPessoaMesada() != null ? Map.of("id", u.getPessoaMesada().getId(), "nome", u.getPessoaMesada().getNome()) : null);
                    return map;
                })
                .toList();
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Map<String, Object> dados) {
        try {
            Usuario usuario = new Usuario();
            usuario.setUsername(dados.get("username").toString());
            usuario.setEmail(dados.get("email").toString());
            usuario.setPassword(passwordEncoder.encode(dados.get("password").toString()));
            usuario.setRole(Usuario.Role.valueOf(dados.get("role").toString()));
            
            if (dados.containsKey("pessoaMesadaId") && dados.get("pessoaMesadaId") != null) {
                var pessoa = pessoaRepository.findById(Long.valueOf(dados.get("pessoaMesadaId").toString())).orElseThrow();
                usuario.setPessoaMesada(pessoa);
            }
            
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            Usuario usuario = usuarioRepository.findById(id).orElseThrow();
            usuario.setUsername(dados.get("username").toString());
            usuario.setEmail(dados.get("email").toString());
            usuario.setRole(Usuario.Role.valueOf(dados.get("role").toString()));
            
            if (dados.containsKey("password") && !dados.get("password").toString().isEmpty()) {
                usuario.setPassword(passwordEncoder.encode(dados.get("password").toString()));
            }
            
            if (dados.containsKey("pessoaMesadaId") && dados.get("pessoaMesadaId") != null && !dados.get("pessoaMesadaId").toString().isEmpty()) {
                var pessoa = pessoaRepository.findById(Long.valueOf(dados.get("pessoaMesadaId").toString())).orElseThrow();
                usuario.setPessoaMesada(pessoa);
            } else {
                usuario.setPessoaMesada(null);
            }
            
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        try {
            usuarioRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> obterUsuarioLogado(@RequestParam String username) {
        try {
            var usuario = usuarioRepository.findByUsername(username).orElseThrow();
            return ResponseEntity.ok(Map.of(
                "id", usuario.getId(),
                "username", usuario.getUsername(),
                "email", usuario.getEmail(),
                "role", usuario.getRole().toString(),
                "pessoaMesada", usuario.getPessoaMesada() != null ? Map.of("id", usuario.getPessoaMesada().getId(), "nome", usuario.getPessoaMesada().getNome()) : null
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
