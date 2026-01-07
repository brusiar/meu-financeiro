package com.financeiro.controller;

import com.financeiro.model.FonteRenda;
import com.financeiro.model.HistoricoRendimento;
import com.financeiro.model.Usuario;
import com.financeiro.repository.FonteRendaRepository;
import com.financeiro.repository.HistoricoRendimentoRepository;
import com.financeiro.repository.UsuarioRepository;

import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rendimentos")
public class RendimentoController {

    @Autowired
    private FonteRendaRepository rendaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private HistoricoRendimentoRepository historicoRepository;

    @GetMapping
    public ResponseEntity<?> listar(
            @RequestParam String username,
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes) {
        try {
            var rendimentos = rendaRepository.findAll().stream()
                .filter(r -> r.getUsuario().getUsername().equals(username));
            
            if (ano != null && mes != null) {
                rendimentos = rendimentos.filter(r -> 
                    r.getDataRecebimento() != null &&
                    r.getDataRecebimento().getYear() == ano &&
                    r.getDataRecebimento().getMonthValue() == mes
                );
            }
            
            return ResponseEntity.ok(rendimentos.toList());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Map<String, Object> dados) {
        try {
            String username = (String) dados.get("username");
            Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            FonteRenda renda = new FonteRenda();
            renda.setDescricao((String) dados.get("descricao"));
            renda.setValor(new java.math.BigDecimal(dados.get("valor").toString()));
            
            String dataStr = (String) dados.get("dataRecebimento");
            String[] partes = dataStr.split("/");
            LocalDate data = LocalDate.of(Integer.parseInt(partes[2]), Integer.parseInt(partes[1]), Integer.parseInt(partes[0]));
            renda.setDataRecebimento(data);
            
            renda.setRecorrente((Boolean) dados.get("recorrente"));
            renda.setUsuario(usuario);

            FonteRenda rendaSalva = rendaRepository.save(renda);
            return ResponseEntity.ok(Map.of("success", true, "message", "Rendimento cadastrado com sucesso", "id", rendaSalva.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            FonteRenda renda = rendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendimento não encontrado"));

            renda.setDescricao((String) dados.get("descricao"));
            renda.setValor(new java.math.BigDecimal(dados.get("valor").toString()));
            
            String dataStr = (String) dados.get("dataRecebimento");
            String[] partes = dataStr.split("/");
            LocalDate data = LocalDate.of(Integer.parseInt(partes[2]), Integer.parseInt(partes[1]), Integer.parseInt(partes[0]));
            renda.setDataRecebimento(data);
            
            renda.setRecorrente((Boolean) dados.get("recorrente"));

            rendaRepository.save(renda);
            return ResponseEntity.ok(Map.of("success", true, "message", "Rendimento atualizado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        try {
            historicoRepository.deleteByFonteRendaId(id);
            rendaRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Rendimento excluído com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/registrar/{id}")
    public ResponseEntity<?> registrarRecebimento(@PathVariable Long id) {
        try {
            FonteRenda renda = rendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendimento não encontrado"));

            LocalDate dataRecebimento = renda.getDataRecebimento();
            HistoricoRendimento historico = new HistoricoRendimento();
            historico.setDescricao(renda.getDescricao());
            historico.setValor(renda.getValor());
            historico.setDataRecebimento(dataRecebimento);
            historico.setMesReferencia(dataRecebimento.getMonthValue());
            historico.setAnoReferencia(dataRecebimento.getYear());
            historico.setFonteRenda(renda);
            historico.setUsuario(renda.getUsuario());

            historicoRepository.save(historico);
            return ResponseEntity.ok(Map.of("success", true, "message", "Recebimento registrado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/historico")
    public ResponseEntity<?> listarHistorico(@RequestParam String username) {
        try {
            var historico = historicoRepository.findAll().stream()
                .filter(h -> h.getUsuario().getUsername().equals(username))
                .sorted((a, b) -> b.getDataRecebimento().compareTo(a.getDataRecebimento()))
                .toList();
            return ResponseEntity.ok(historico);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
