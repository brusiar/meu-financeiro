package com.financeiro.controller;

import com.financeiro.model.ContaRecorrente;
import com.financeiro.repository.CategoriaRepository;
import com.financeiro.repository.ContaRecorrenteRepository;
import com.financeiro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contas-recorrentes")
public class ContaRecorrenteController {

    @Autowired
    private ContaRecorrenteRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping
    public List<ContaRecorrente> listar(@RequestParam String username) {
        return repository.findByUsuarioUsernameOrderByNomeAsc(username);
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Map<String, Object> dados) {
        try {
            var usuario = usuarioRepository.findByUsername(dados.get("username").toString()).orElseThrow();
            ContaRecorrente conta = new ContaRecorrente();
            conta.setNome(dados.get("nome").toString());
            conta.setDescricao(dados.containsKey("descricao") && dados.get("descricao") != null ? dados.get("descricao").toString() : null);
            conta.setUsuario(usuario);
            if (dados.containsKey("categoriaId") && dados.get("categoriaId") != null) {
                categoriaRepository.findById(Long.valueOf(dados.get("categoriaId").toString())).ifPresent(conta::setCategoria);
            }
            var salva = repository.save(conta);
            var categoriaId = salva.getCategoria() != null ? salva.getCategoria().getId() : null;
            var categoriaNome = salva.getCategoria() != null ? salva.getCategoria().getNome() : null;
            return ResponseEntity.ok(Map.of("success", true, "id", salva.getId(), "nome", salva.getNome(),
                "descricao", salva.getDescricao() != null ? salva.getDescricao() : "",
                "categoriaId", categoriaId != null ? categoriaId : "",
                "categoriaNome", categoriaNome != null ? categoriaNome : ""));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            ContaRecorrente conta = repository.findById(id).orElseThrow();
            conta.setNome(dados.get("nome").toString());
            conta.setDescricao(dados.containsKey("descricao") && dados.get("descricao") != null ? dados.get("descricao").toString() : null);
            if (dados.containsKey("categoriaId") && dados.get("categoriaId") != null) {
                categoriaRepository.findById(Long.valueOf(dados.get("categoriaId").toString())).ifPresent(conta::setCategoria);
            } else {
                conta.setCategoria(null);
            }
            repository.save(conta);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        try {
            repository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
