package com.financeiro.controller;

import com.financeiro.model.Categoria;
import com.financeiro.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findByTipoOrderByNome(Categoria.TipoCategoria.DESPESA);
    }

    @PostMapping
    public ResponseEntity<?> criarCategoria(@RequestBody Map<String, String> dados) {
        try {
            Categoria categoria = new Categoria();
            categoria.setNome(dados.get("nome"));
            categoria.setTipo(Categoria.TipoCategoria.DESPESA);
            
            categoriaRepository.save(categoria);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarCategoria(@PathVariable Long id, @RequestBody Map<String, String> dados) {
        try {
            Categoria categoria = categoriaRepository.findById(id).orElseThrow();
            categoria.setNome(dados.get("nome"));
            
            categoriaRepository.save(categoria);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluirCategoria(@PathVariable Long id) {
        try {
            categoriaRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}