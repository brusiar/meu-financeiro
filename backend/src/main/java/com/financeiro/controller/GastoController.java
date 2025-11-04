package com.financeiro.controller;

import com.financeiro.model.GastoCartao;
import com.financeiro.repository.CartaoCreditoRepository;
import com.financeiro.repository.CategoriaRepository;
import com.financeiro.repository.GastoCartaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gastos")
public class GastoController {

    @Autowired
    private GastoCartaoRepository gastoRepository;

    @Autowired
    private CartaoCreditoRepository cartaoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping("/cartao/{cartaoId}")
    public List<GastoCartao> listarGastos(@PathVariable Long cartaoId) {
        return gastoRepository.findByCartaoIdAndFaturadoFalseOrderByDataGastoDesc(cartaoId);
    }

    @PostMapping
    public ResponseEntity<?> criarGasto(@RequestBody Map<String, Object> dados) {
        try {
            var cartao = cartaoRepository.findById(Long.valueOf(dados.get("cartaoId").toString())).orElseThrow();
            var categoria = categoriaRepository.findById(Long.valueOf(dados.get("categoriaId").toString())).orElseThrow();
            
            GastoCartao gasto = new GastoCartao();
            gasto.setValor(new BigDecimal(dados.get("valor").toString()));
            gasto.setEstabelecimento(dados.get("estabelecimento").toString());
            gasto.setCartao(cartao);
            gasto.setCategoria(categoria);
            
            if (dados.containsKey("dataGasto")) {
                gasto.setDataGasto(java.time.LocalDateTime.parse(dados.get("dataGasto").toString()));
            }
            
            // Verificar se é parcelado
            if (dados.containsKey("parcelado") && Boolean.parseBoolean(dados.get("parcelado").toString())) {
                gasto.setParcelado(true);
                gasto.setParcelasTotal(Integer.valueOf(dados.get("parcelasTotal").toString()));
                gasto.setParcelasRestantes(Integer.valueOf(dados.get("parcelasTotal").toString()));
                gasto.setValorTotal(new BigDecimal(dados.get("valorTotal").toString()));
            }
            
            gastoRepository.save(gasto);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarGasto(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            GastoCartao gasto = gastoRepository.findById(id).orElseThrow();
            var categoria = categoriaRepository.findById(Long.valueOf(dados.get("categoriaId").toString())).orElseThrow();
            
            gasto.setValor(new BigDecimal(dados.get("valor").toString()));
            gasto.setEstabelecimento(dados.get("estabelecimento").toString());
            gasto.setCategoria(categoria);
            
            if (dados.containsKey("dataGasto")) {
                gasto.setDataGasto(java.time.LocalDateTime.parse(dados.get("dataGasto").toString()));
            }
            
            gastoRepository.save(gasto);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluirGasto(@PathVariable Long id) {
        try {
            gastoRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}