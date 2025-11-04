package com.financeiro.controller;

import com.financeiro.repository.GastoCartaoRepository;
import com.financeiro.repository.ContaPagarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private GastoCartaoRepository gastoRepository;
    
    @Autowired
    private ContaPagarRepository contaRepository;

    @GetMapping("/gastos-categoria")
    public ResponseEntity<?> listarGastosPorCategoria(@RequestParam String username) {
        try {
            LocalDate mesPassado = LocalDate.now().minusMonths(1);
            LocalDateTime inicio = mesPassado.withDayOfMonth(1).atStartOfDay();
            LocalDateTime fim = mesPassado.withDayOfMonth(mesPassado.lengthOfMonth()).atTime(23, 59, 59);
            
            var gastosCartao = gastoRepository.findAll().stream()
                .filter(g -> g.getCartao().getUsuario().getUsername().equals(username))
                .filter(g -> (g.getDataGasto().isEqual(inicio) || g.getDataGasto().isAfter(inicio)) && 
                            (g.getDataGasto().isEqual(fim) || g.getDataGasto().isBefore(fim)))
                .collect(Collectors.groupingBy(
                    g -> g.getCategoria().getNome(),
                    Collectors.reducing(
                        java.math.BigDecimal.ZERO,
                        g -> g.getValor(),
                        java.math.BigDecimal::add
                    )
                ));
            
            var contasPagas = contaRepository.findAll().stream()
                .filter(c -> c.getUsuario().getUsername().equals(username))
                .filter(c -> c.isPago())
                .filter(c -> c.getTipo() != com.financeiro.model.ContaPagar.TipoConta.FATURA_CARTAO)
                .filter(c -> c.getDataPagamento() != null)
                .filter(c -> (c.getDataPagamento().isEqual(inicio.toLocalDate()) || c.getDataPagamento().isAfter(inicio.toLocalDate())) && 
                            (c.getDataPagamento().isEqual(fim.toLocalDate()) || c.getDataPagamento().isBefore(fim.toLocalDate())))
                .collect(Collectors.groupingBy(
                    c -> c.getCategoria().getNome(),
                    Collectors.reducing(
                        java.math.BigDecimal.ZERO,
                        c -> c.getValor(),
                        java.math.BigDecimal::add
                    )
                ));
            
            contasPagas.forEach((categoria, valor) -> 
                gastosCartao.merge(categoria, valor, java.math.BigDecimal::add)
            );
            
            var gastos = gastosCartao.entrySet().stream()
                .map(entry -> Map.of(
                    "categoria", entry.getKey(),
                    "total", entry.getValue()
                ))
                .sorted((a, b) -> ((java.math.BigDecimal)b.get("total")).compareTo((java.math.BigDecimal)a.get("total")))
                .toList();
            
            return ResponseEntity.ok(gastos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/gastos-categoria-atual")
    public ResponseEntity<?> listarGastosPorCategoriaAtual(@RequestParam String username) {
        try {
            LocalDate mesAtual = LocalDate.now();
            LocalDateTime inicio = mesAtual.withDayOfMonth(1).atStartOfDay();
            LocalDateTime fim = mesAtual.withDayOfMonth(mesAtual.lengthOfMonth()).atTime(23, 59, 59);
            
            var gastosCartao = gastoRepository.findAll().stream()
                .filter(g -> g.getCartao().getUsuario().getUsername().equals(username))
                .filter(g -> (g.getDataGasto().isEqual(inicio) || g.getDataGasto().isAfter(inicio)) && 
                            (g.getDataGasto().isEqual(fim) || g.getDataGasto().isBefore(fim)))
                .collect(Collectors.groupingBy(
                    g -> g.getCategoria().getNome(),
                    Collectors.reducing(
                        java.math.BigDecimal.ZERO,
                        g -> g.getValor(),
                        java.math.BigDecimal::add
                    )
                ));
            
            var contasPagas = contaRepository.findAll().stream()
                .filter(c -> c.getUsuario().getUsername().equals(username))
                .filter(c -> c.isPago())
                .filter(c -> c.getTipo() != com.financeiro.model.ContaPagar.TipoConta.FATURA_CARTAO)
                .filter(c -> c.getDataPagamento() != null)
                .filter(c -> (c.getDataPagamento().isEqual(inicio.toLocalDate()) || c.getDataPagamento().isAfter(inicio.toLocalDate())) && 
                            (c.getDataPagamento().isEqual(fim.toLocalDate()) || c.getDataPagamento().isBefore(fim.toLocalDate())))
                .collect(Collectors.groupingBy(
                    c -> c.getCategoria().getNome(),
                    Collectors.reducing(
                        java.math.BigDecimal.ZERO,
                        c -> c.getValor(),
                        java.math.BigDecimal::add
                    )
                ));
            
            contasPagas.forEach((categoria, valor) -> 
                gastosCartao.merge(categoria, valor, java.math.BigDecimal::add)
            );
            
            var gastos = gastosCartao.entrySet().stream()
                .map(entry -> Map.of(
                    "categoria", entry.getKey(),
                    "total", entry.getValue()
                ))
                .sorted((a, b) -> ((java.math.BigDecimal)b.get("total")).compareTo((java.math.BigDecimal)a.get("total")))
                .toList();
            
            return ResponseEntity.ok(gastos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/gastos-cartao")
    public ResponseEntity<?> listarGastosPorCartao(@RequestParam String username) {
        try {
            LocalDate mesAtual = LocalDate.now();
            LocalDateTime inicio = mesAtual.withDayOfMonth(1).atStartOfDay();
            LocalDateTime fim = mesAtual.withDayOfMonth(mesAtual.lengthOfMonth()).atTime(23, 59, 59);
            
            var gastos = gastoRepository.findAll().stream()
                .filter(g -> g.getCartao().getUsuario().getUsername().equals(username))
                .filter(g -> (g.getDataGasto().isEqual(inicio) || g.getDataGasto().isAfter(inicio)) && 
                            (g.getDataGasto().isEqual(fim) || g.getDataGasto().isBefore(fim)))
                .collect(Collectors.groupingBy(
                    g -> g.getCartao().getApelido(),
                    Collectors.reducing(
                        java.math.BigDecimal.ZERO,
                        g -> g.getValor(),
                        java.math.BigDecimal::add
                    )
                ))
                .entrySet().stream()
                .map(entry -> Map.of(
                    "cartao", entry.getKey(),
                    "total", entry.getValue()
                ))
                .sorted((a, b) -> ((java.math.BigDecimal)b.get("total")).compareTo((java.math.BigDecimal)a.get("total")))
                .toList();
            
            return ResponseEntity.ok(gastos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
