package com.financeiro.controller;

import com.financeiro.model.CartaoCredito;
import com.financeiro.repository.CartaoCreditoRepository;
import com.financeiro.repository.GastoCartaoRepository;
import com.financeiro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cartoes")
public class CartaoController {

    @Autowired
    private CartaoCreditoRepository cartaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private GastoCartaoRepository gastoRepository;

    @GetMapping
    public ResponseEntity<?> listarCartoes(@RequestParam String username) {
        var cartoes = cartaoRepository.findByUsuarioUsernameAndAtivoTrue(username);
        var cartoesComTotal = cartoes.stream().map(cartao -> {
            var gastos = gastoRepository.findByCartaoIdAndFaturadoFalseOrderByDataGastoDesc(cartao.getId());
            var total = gastos.stream()
                .map(gasto -> gasto.getValor())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            var map = new java.util.HashMap<String, Object>();
            map.put("id", cartao.getId());
            map.put("apelido", cartao.getApelido());
            map.put("banco", cartao.getBanco());
            map.put("ultimosDigitos", cartao.getUltimosDigitos());
            map.put("ativo", cartao.isAtivo());
            map.put("diaFechamento", cartao.getDiaFechamento());
            map.put("diaVencimento", cartao.getDiaVencimento());
            map.put("usuario", cartao.getUsuario());
            map.put("totalGastos", total);
            return map;
        }).toList();
        
        return ResponseEntity.ok(cartoesComTotal);
    }

    @PostMapping
    public ResponseEntity<?> criarCartao(@RequestBody Map<String, String> dados) {
        try {
            var usuario = usuarioRepository.findByUsername(dados.get("username")).orElseThrow();
            
            CartaoCredito cartao = new CartaoCredito();
            cartao.setApelido(dados.get("apelido"));
            cartao.setBanco(dados.get("banco"));
            cartao.setUltimosDigitos(dados.get("ultimosDigitos"));
            if (dados.containsKey("diaFechamento") && !dados.get("diaFechamento").isEmpty()) {
                cartao.setDiaFechamento(Integer.parseInt(dados.get("diaFechamento")));
            }
            if (dados.containsKey("diaVencimento") && !dados.get("diaVencimento").isEmpty()) {
                cartao.setDiaVencimento(Integer.parseInt(dados.get("diaVencimento")));
            }
            cartao.setUsuario(usuario);
            
            cartaoRepository.save(cartao);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarCartao(@PathVariable Long id, @RequestBody Map<String, String> dados) {
        try {
            CartaoCredito cartao = cartaoRepository.findById(id).orElseThrow();
            cartao.setApelido(dados.get("apelido"));
            cartao.setBanco(dados.get("banco"));
            cartao.setUltimosDigitos(dados.get("ultimosDigitos"));
            if (dados.containsKey("diaFechamento") && !dados.get("diaFechamento").isEmpty()) {
                cartao.setDiaFechamento(Integer.parseInt(dados.get("diaFechamento")));
            }
            if (dados.containsKey("diaVencimento") && !dados.get("diaVencimento").isEmpty()) {
                cartao.setDiaVencimento(Integer.parseInt(dados.get("diaVencimento")));
            }
            
            cartaoRepository.save(cartao);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluirCartao(@PathVariable Long id) {
        try {
            CartaoCredito cartao = cartaoRepository.findById(id).orElseThrow();
            cartao.setAtivo(false);
            cartaoRepository.save(cartao);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}