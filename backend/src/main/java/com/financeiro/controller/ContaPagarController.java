package com.financeiro.controller;

import com.financeiro.model.ContaPagar;
import com.financeiro.repository.CategoriaRepository;
import com.financeiro.repository.ContaPagarRepository;
import com.financeiro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contas")
public class ContaPagarController {

    @Autowired
    private ContaPagarRepository contaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping
    public List<ContaPagar> listarContas(@RequestParam String username) {
        return contaRepository.findByUsuarioUsernameOrderByDataVencimentoAsc(username);
    }

    @GetMapping("/historico")
    public ResponseEntity<?> listarHistorico(@RequestParam String username) {
        try {
            var todasContas = contaRepository.findByUsuarioUsernameOrderByDataVencimentoAsc(username)
                .stream()
                .filter(ContaPagar::isPago)
                .toList();
            
            var historicoMensal = todasContas.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    conta -> conta.getDataVencimento().getYear() + "-" + 
                            String.format("%02d", conta.getDataVencimento().getMonthValue())
                ))
                .entrySet().stream()
                .map(entry -> {
                    var anoMes = entry.getKey();
                    var contas = entry.getValue();
                    var total = contas.stream()
                        .map(ContaPagar::getValor)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    var partes = anoMes.split("-");
                    var data = LocalDate.of(Integer.parseInt(partes[0]), Integer.parseInt(partes[1]), 1);
                    var mesAno = data.format(java.time.format.DateTimeFormatter.ofPattern("MMMM 'de' yyyy", new java.util.Locale("pt", "BR")));
                    
                    return Map.of(
                        "anoMes", anoMes,
                        "mesAno", mesAno,
                        "total", total,
                        "quantidade", contas.size()
                    );
                })
                .sorted((a, b) -> ((String)b.get("anoMes")).compareTo((String)a.get("anoMes")))
                .toList();
            
            return ResponseEntity.ok(historicoMensal);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/mes-historico")
    public List<ContaPagar> listarContasMesHistorico(@RequestParam String username, @RequestParam int ano, @RequestParam int mes) {
        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim = inicio.plusMonths(1).minusDays(1);
        return contaRepository.findByUsuarioUsernameAndDataVencimentoBetweenOrderByDataVencimentoAsc(username, inicio, fim)
            .stream()
            .filter(ContaPagar::isPago)
            .toList();
    }



    @GetMapping("/pendentes")
    public List<ContaPagar> listarContasPendentes(@RequestParam String username) {
        return contaRepository.findByUsuarioUsernameAndPagoFalseOrderByDataVencimentoAsc(username);
    }

    @GetMapping("/resumo-mes")
    public ResponseEntity<?> resumoMesAtual(@RequestParam String username) {
        try {
            LocalDate hoje = LocalDate.now();
            LocalDate inicio = hoje.withDayOfMonth(1);
            LocalDate fim = hoje.withDayOfMonth(hoje.lengthOfMonth());
            
            var contasMes = contaRepository.findByUsuarioUsernameAndDataVencimentoBetweenOrderByDataVencimentoAsc(username, inicio, fim);
            
            var pendentes = contasMes.stream().filter(c -> !c.isPago()).toList();
            var pagas = contasMes.stream().filter(ContaPagar::isPago).toList();
            
            var totalPendente = pendentes.stream()
                .map(ContaPagar::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            var totalPago = pagas.stream()
                .map(ContaPagar::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            var totalMes = totalPendente.add(totalPago);
            
            return ResponseEntity.ok(Map.of(
                "pendentes", pendentes.size(),
                "pagas", pagas.size(),
                "total", contasMes.size(),
                "valorPendente", totalPendente,
                "valorPago", totalPago,
                "valorTotal", totalMes
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> criarConta(@RequestBody Map<String, Object> dados) {
        try {
            System.out.println("Dados recebidos: " + dados);
            var usuario = usuarioRepository.findByUsername(dados.get("username").toString()).orElseThrow();
            var categoria = categoriaRepository.findById(Long.valueOf(dados.get("categoriaId").toString())).orElseThrow();
            
            ContaPagar conta = new ContaPagar();
            conta.setDescricao(dados.get("descricao").toString());
            conta.setValor(new BigDecimal(dados.get("valor").toString()));
            boolean recorrente = Boolean.parseBoolean(dados.get("recorrente").toString());
            conta.setTipo(recorrente ? ContaPagar.TipoConta.FIXA : ContaPagar.TipoConta.VARIAVEL);
            conta.setRecorrente(recorrente);
            conta.setUsuario(usuario);
            conta.setCategoria(categoria);
            
            conta.setDiaVencimento(Integer.valueOf(dados.get("diaVencimento").toString()));
            
            LocalDate hoje = LocalDate.now();
            LocalDate proximoMes = hoje.plusMonths(1);
            int diaVenc = conta.getDiaVencimento();
            int ultimoDiaMes = proximoMes.lengthOfMonth();
            conta.setDataVencimento(proximoMes.withDayOfMonth(Math.min(diaVenc, ultimoDiaMes)));
            
            ContaPagar contaSalva = contaRepository.save(conta);
            System.out.println("Conta salva com ID: " + contaSalva.getId());
            return ResponseEntity.ok(Map.of("success", true, "id", contaSalva.getId()));
        } catch (Exception e) {
            System.out.println("Erro ao salvar conta: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarConta(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        try {
            ContaPagar conta = contaRepository.findById(id).orElseThrow();
            var categoria = categoriaRepository.findById(Long.valueOf(dados.get("categoriaId").toString())).orElseThrow();
            
            conta.setDescricao(dados.get("descricao").toString());
            conta.setValor(new BigDecimal(dados.get("valor").toString()));
            conta.setRecorrente(Boolean.parseBoolean(dados.get("recorrente").toString()));
            conta.setCategoria(categoria);
            
            conta.setDiaVencimento(Integer.valueOf(dados.get("diaVencimento").toString()));
            
            // Manter a data de vencimento no mesmo mês
            LocalDate dataAtual = conta.getDataVencimento();
            int diaVenc = conta.getDiaVencimento();
            int ultimoDiaMes = dataAtual.lengthOfMonth();
            conta.setDataVencimento(dataAtual.withDayOfMonth(Math.min(diaVenc, ultimoDiaMes)));
            
            contaRepository.save(conta);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/pagar")
    public ResponseEntity<?> marcarComoPago(@PathVariable Long id) {
        try {
            ContaPagar conta = contaRepository.findById(id).orElseThrow();
            conta.setPago(true);
            conta.setDataPagamento(LocalDate.now());
            contaRepository.save(conta);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluirConta(@PathVariable Long id) {
        try {
            contaRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}