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
    public ResponseEntity<?> listarGastosPorCategoriaAtual(
            @RequestParam String username,
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes) {
        try {
            LocalDate mesAtual = (ano != null && mes != null) ? LocalDate.of(ano, mes, 1) : LocalDate.now();
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

    @GetMapping("/resumo-mes")
    public ResponseEntity<?> resumoMes(
            @RequestParam String username,
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes) {
        try {
            LocalDate mesReferencia = (ano != null && mes != null) ? LocalDate.of(ano, mes, 1) : LocalDate.now();
            LocalDate inicio = mesReferencia.withDayOfMonth(1);
            LocalDate fim = mesReferencia.withDayOfMonth(mesReferencia.lengthOfMonth());
            
            var contas = contaRepository.findAll().stream()
                .filter(c -> c.getUsuario().getUsername().equals(username))
                .filter(c -> !c.getDataVencimento().isBefore(inicio) && !c.getDataVencimento().isAfter(fim))
                .toList();
            
            var totalContas = contas.stream()
                .map(c -> c.getValor())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            
            var contasPagas = contas.stream().filter(c -> c.isPago()).count();
            var contasPendentes = contas.stream().filter(c -> !c.isPago()).count();
            
            return ResponseEntity.ok(Map.of(
                "totalContas", totalContas,
                "quantidadeContas", contas.size(),
                "contasPagas", contasPagas,
                "contasPendentes", contasPendentes,
                "mes", mesReferencia.getMonthValue(),
                "ano", mesReferencia.getYear()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
