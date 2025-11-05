package com.financeiro.controller;

import com.financeiro.model.AcaoMesada;
import com.financeiro.model.Pessoa;
import com.financeiro.repository.AcaoMesadaRepository;
import com.financeiro.repository.PessoaRepository;
import com.financeiro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/mesada")
public class MesadaController {

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private AcaoMesadaRepository acaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/pessoas")
    public ResponseEntity<?> listarPessoas(@RequestParam String username) {
        try {
            var pessoas = pessoaRepository.findAll().stream()
                .filter(p -> p.getUsuario().getUsername().equals(username))
                .toList();
            return ResponseEntity.ok(pessoas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/pessoas")
    public ResponseEntity<?> criarPessoa(@RequestBody Map<String, Object> dados) {
        try {
            var usuario = usuarioRepository.findByUsername(dados.get("username").toString()).orElseThrow();
            
            Pessoa pessoa = new Pessoa();
            pessoa.setNome(dados.get("nome").toString());
            pessoa.setValorMesada(new BigDecimal(dados.get("valorMesada").toString()));
            pessoa.setUsuario(usuario);
            
            pessoaRepository.save(pessoa);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/pessoas/{id}")
    public ResponseEntity<?> atualizarPessoa(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            Pessoa pessoa = pessoaRepository.findById(id).orElseThrow();
            pessoa.setNome(dados.get("nome").toString());
            pessoa.setValorMesada(new BigDecimal(dados.get("valorMesada").toString()));
            pessoaRepository.save(pessoa);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/pessoas/{id}")
    public ResponseEntity<?> excluirPessoa(@PathVariable Long id) {
        try {
            pessoaRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/acoes/{pessoaId}")
    public ResponseEntity<?> listarAcoes(@PathVariable Long pessoaId) {
        try {
            LocalDate hoje = LocalDate.now();
            LocalDate inicio = hoje.withDayOfMonth(1);
            
            var acoes = acaoRepository.findAll().stream()
                .filter(a -> a.getPessoa().getId().equals(pessoaId))
                .filter(a -> !a.getData().isBefore(inicio))
                .toList();
            return ResponseEntity.ok(acoes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/acoes")
    public ResponseEntity<?> criarAcao(@RequestBody Map<String, Object> dados) {
        try {
            var pessoa = pessoaRepository.findById(Long.valueOf(dados.get("pessoaId").toString())).orElseThrow();
            
            AcaoMesada acao = new AcaoMesada();
            acao.setDescricao(dados.get("descricao").toString());
            acao.setValor(new BigDecimal(dados.get("valor").toString()));
            acao.setTipo(AcaoMesada.TipoAcao.valueOf(dados.get("tipo").toString()));
            acao.setData(dados.containsKey("data") ? LocalDate.parse(dados.get("data").toString()) : LocalDate.now());
            acao.setPessoa(pessoa);
            
            acaoRepository.save(acao);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/acoes/{id}")
    public ResponseEntity<?> atualizarAcao(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            AcaoMesada acao = acaoRepository.findById(id).orElseThrow();
            acao.setDescricao(dados.get("descricao").toString());
            acao.setValor(new BigDecimal(dados.get("valor").toString()));
            acao.setTipo(AcaoMesada.TipoAcao.valueOf(dados.get("tipo").toString()));
            acao.setData(LocalDate.parse(dados.get("data").toString()));
            acaoRepository.save(acao);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/acoes/{id}")
    public ResponseEntity<?> excluirAcao(@PathVariable Long id) {
        try {
            acaoRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/relatorio/{pessoaId}")
    public ResponseEntity<?> gerarRelatorio(@PathVariable Long pessoaId) {
        try {
            var pessoa = pessoaRepository.findById(pessoaId).orElseThrow();
            LocalDate hoje = LocalDate.now();
            LocalDate inicio = hoje.withDayOfMonth(1);
            
            var acoes = acaoRepository.findAll().stream()
                .filter(a -> a.getPessoa().getId().equals(pessoaId))
                .filter(a -> !a.getData().isBefore(inicio))
                .toList();
            
            BigDecimal totalAcrescimos = acoes.stream()
                .filter(a -> a.getTipo() == AcaoMesada.TipoAcao.ACRESCIMO)
                .map(AcaoMesada::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal totalDescontos = acoes.stream()
                .filter(a -> a.getTipo() == AcaoMesada.TipoAcao.DESCONTO)
                .map(AcaoMesada::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal valorFinal = pessoa.getValorMesada().add(totalAcrescimos).subtract(totalDescontos);
            
            return ResponseEntity.ok(Map.of(
                "pessoa", pessoa.getNome(),
                "valorBase", pessoa.getValorMesada(),
                "totalAcrescimos", totalAcrescimos,
                "totalDescontos", totalDescontos,
                "valorFinal", valorFinal,
                "acoes", acoes
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
