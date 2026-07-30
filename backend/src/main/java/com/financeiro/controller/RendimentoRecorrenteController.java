package com.financeiro.controller;

import com.financeiro.model.RendimentoRecorrente;
import com.financeiro.repository.FonteRendaRepository;
import com.financeiro.repository.RendimentoRecorrenteRepository;
import com.financeiro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rendimentos-recorrentes")
public class RendimentoRecorrenteController {

    @Autowired
    private RendimentoRecorrenteRepository repository;

    @Autowired
    private FonteRendaRepository fonteRendaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<RendimentoRecorrente> listar(@RequestParam String username) {
        return repository.findByUsuarioUsernameOrderByNomeAsc(username);
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Map<String, Object> dados) {
        try {
            var usuario = usuarioRepository.findByUsername(dados.get("username").toString()).orElseThrow();
            RendimentoRecorrente rr = new RendimentoRecorrente();
            rr.setNome(dados.get("nome").toString());
            rr.setDescricao(dados.containsKey("descricao") && dados.get("descricao") != null ? dados.get("descricao").toString() : null);
            rr.setUsuario(usuario);
            var salvo = repository.save(rr);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "id", salvo.getId(),
                "nome", salvo.getNome(),
                "descricao", salvo.getDescricao() != null ? salvo.getDescricao() : ""
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            RendimentoRecorrente rr = repository.findById(id).orElseThrow();
            rr.setNome(dados.get("nome").toString());
            rr.setDescricao(dados.containsKey("descricao") && dados.get("descricao") != null ? dados.get("descricao").toString() : null);
            repository.save(rr);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        try {
            fonteRendaRepository.desvincularPagador(id);
            repository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
