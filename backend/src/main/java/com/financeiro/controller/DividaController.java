package com.financeiro.controller;

import com.financeiro.model.Divida;
import com.financeiro.model.PagamentoDivida;
import com.financeiro.repository.DividaRepository;
import com.financeiro.repository.PagamentoDividaRepository;
import com.financeiro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/dividas")
public class DividaController {

    @Autowired
    private DividaRepository dividaRepository;

    @Autowired
    private PagamentoDividaRepository pagamentoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<?> listar(@RequestParam String username) {
        try {
            var dividas = dividaRepository.findAll().stream()
                .filter(d -> d.getUsuario().getUsername().equals(username))
                .toList();
            return ResponseEntity.ok(dividas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Map<String, Object> dados) {
        try {
            var usuario = usuarioRepository.findByUsername(dados.get("username").toString()).orElseThrow();
            
            Divida divida = new Divida();
            divida.setInstituicao(dados.get("instituicao").toString());
            divida.setValorTotal(new BigDecimal(dados.get("valorTotal").toString()));
            divida.setTaxaJuros(new BigDecimal(dados.get("taxaJuros").toString()));
            divida.setTipoTaxa(Divida.TipoTaxa.valueOf(dados.get("tipoTaxa").toString()));
            divida.setSaldoDevedor(new BigDecimal(dados.get("saldoDevedor").toString()));
            divida.setDataCadastro(LocalDate.now());
            divida.setUsuario(usuario);
            
            dividaRepository.save(divida);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            Divida divida = dividaRepository.findById(id).orElseThrow();
            divida.setInstituicao(dados.get("instituicao").toString());
            divida.setValorTotal(new BigDecimal(dados.get("valorTotal").toString()));
            divida.setTaxaJuros(new BigDecimal(dados.get("taxaJuros").toString()));
            divida.setTipoTaxa(Divida.TipoTaxa.valueOf(dados.get("tipoTaxa").toString()));
            divida.setSaldoDevedor(new BigDecimal(dados.get("saldoDevedor").toString()));
            dividaRepository.save(divida);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        try {
            dividaRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/pagamentos")
    public ResponseEntity<?> listarPagamentos(@PathVariable Long id) {
        try {
            var pagamentos = pagamentoRepository.findAll().stream()
                .filter(p -> p.getDivida().getId().equals(id))
                .toList();
            return ResponseEntity.ok(pagamentos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/pagamentos")
    public ResponseEntity<?> registrarPagamento(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            Divida divida = dividaRepository.findById(id).orElseThrow();
            
            PagamentoDivida pagamento = new PagamentoDivida();
            pagamento.setDivida(divida);
            pagamento.setDataPagamento(LocalDate.parse(dados.get("dataPagamento").toString()));
            pagamento.setValorPago(new BigDecimal(dados.get("valorPago").toString()));
            pagamentoRepository.save(pagamento);
            
            // Atualiza saldo devedor
            BigDecimal novoSaldo = divida.getSaldoDevedor().subtract(pagamento.getValorPago());
            divida.setSaldoDevedor(novoSaldo);
            dividaRepository.save(divida);
            
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/pagamentos/{id}")
    public ResponseEntity<?> excluirPagamento(@PathVariable Long id) {
        try {
            PagamentoDivida pagamento = pagamentoRepository.findById(id).orElseThrow();
            Divida divida = pagamento.getDivida();
            
            // Restaura saldo devedor
            BigDecimal novoSaldo = divida.getSaldoDevedor().add(pagamento.getValorPago());
            divida.setSaldoDevedor(novoSaldo);
            dividaRepository.save(divida);
            
            pagamentoRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
