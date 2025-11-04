package com.financeiro.controller;

import com.financeiro.model.ContaPagar;
import com.financeiro.model.Fatura;
import com.financeiro.model.GastoCartao;
import com.financeiro.repository.CartaoCreditoRepository;
import com.financeiro.repository.CategoriaRepository;
import com.financeiro.repository.ContaPagarRepository;
import com.financeiro.repository.FaturaRepository;
import com.financeiro.repository.GastoCartaoRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fatura")
public class FaturaController {

    @Autowired
    private CartaoCreditoRepository cartaoRepository;

    @Autowired
    private GastoCartaoRepository gastoRepository;

    @Autowired
    private FaturaRepository faturaRepository;

    @Autowired
    private ContaPagarRepository contaPagarRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @PostMapping("/gerar-pdf/{cartaoId}")
    public ResponseEntity<byte[]> gerarPDF(@PathVariable Long cartaoId, @RequestBody String mesReferencia) {
        try {
            var cartao = cartaoRepository.findById(cartaoId).orElseThrow();
            var gastos = gastoRepository.findByCartaoIdOrderByDataGastoDesc(cartaoId);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Título
            document.add(new Paragraph("FATURA DO CARTÃO DE CRÉDITO")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(18)
                .setBold());

            // Informações do cartão
            document.add(new Paragraph("Cartão: " + cartao.getApelido()));
            document.add(new Paragraph("Banco: " + cartao.getBanco()));
            document.add(new Paragraph("Final: **** " + cartao.getUltimosDigitos()));
            document.add(new Paragraph("Mês de Referência: " + mesReferencia.replace("\"", "")));
            document.add(new Paragraph(" "));

            // Tabela de gastos
            Table table = new Table(4);
            table.addHeaderCell("Data");
            table.addHeaderCell("Estabelecimento");
            table.addHeaderCell("Categoria");
            table.addHeaderCell("Valor");

            BigDecimal total = BigDecimal.ZERO;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            for (var gasto : gastos) {
                table.addCell(gasto.getDataGasto().format(formatter));
                table.addCell(gasto.getEstabelecimento());
                table.addCell(gasto.getCategoria().getNome());
                table.addCell("R$ " + gasto.getValor().toString());
                total = total.add(gasto.getValor());
            }

            document.add(table);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("TOTAL: R$ " + total.toString())
                .setTextAlignment(TextAlignment.RIGHT)
                .setFontSize(14)
                .setBold());

            document.close();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                "fatura_" + cartao.getApelido() + "_" + mesReferencia.replace("\"", "").replace("/", "-") + ".pdf");

            return ResponseEntity.ok()
                .headers(headers)
                .body(baos.toByteArray());

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/fechar-fatura/{cartaoId}")
    public ResponseEntity<?> fecharFatura(@PathVariable Long cartaoId, @RequestBody String mesReferencia) {
        try {
            var cartao = cartaoRepository.findById(cartaoId).orElseThrow();
            var gastos = gastoRepository.findByCartaoIdAndFaturadoFalseOrderByDataGastoDesc(cartaoId);
            
            // Calcular total da fatura
            BigDecimal total = gastos.stream()
                .map(gasto -> gasto.getValor())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Criar fatura
            Fatura fatura = new Fatura(cartao, mesReferencia.replace("\"", ""), total);
            faturaRepository.save(fatura);
            
            // Criar conta a pagar para a fatura
            var categoriaCartao = categoriaRepository.findByTipoOrderByNome(com.financeiro.model.Categoria.TipoCategoria.DESPESA)
                .stream().filter(c -> c.getNome().equals("Cartão de Crédito")).findFirst()
                .orElse(categoriaRepository.findByTipoOrderByNome(com.financeiro.model.Categoria.TipoCategoria.DESPESA).get(0));
            
            // Calcular data de vencimento baseado no dia de vencimento do cartão
            var hoje = java.time.LocalDate.now();
            var dataVencimento = hoje.plusMonths(1);
            if (cartao.getDiaVencimento() != null) {
                int diaVenc = Math.min(cartao.getDiaVencimento(), dataVencimento.lengthOfMonth());
                dataVencimento = dataVencimento.withDayOfMonth(diaVenc);
            } else {
                dataVencimento = dataVencimento.withDayOfMonth(1);
            }
            
            ContaPagar contaFatura = new ContaPagar();
            contaFatura.setDescricao("Fatura " + cartao.getApelido() + " - " + mesReferencia.replace("\"", ""));
            contaFatura.setValor(total);
            contaFatura.setDataVencimento(dataVencimento);
            contaFatura.setDiaVencimento(cartao.getDiaVencimento());
            contaFatura.setTipo(ContaPagar.TipoConta.FATURA_CARTAO);
            contaFatura.setUsuario(cartao.getUsuario());
            contaFatura.setCategoria(categoriaCartao);
            contaFatura.setFatura(fatura);
            contaPagarRepository.save(contaFatura);
            
            // Processar gastos
            for (var gasto : gastos) {
                if (gasto.isParcelado() && gasto.getParcelasRestantes() > 1) {
                    // Marcar como faturado e diminuir parcela
                    gasto.setFaturado(true);
                    gasto.setFatura(fatura);
                    gastoRepository.save(gasto);
                    
                    // Criar novo gasto para próxima parcela
                    var novoGasto = new GastoCartao();
                    novoGasto.setValor(gasto.getValor());
                    novoGasto.setEstabelecimento(gasto.getEstabelecimento());
                    novoGasto.setCartao(gasto.getCartao());
                    novoGasto.setCategoria(gasto.getCategoria());
                    novoGasto.setDataGasto(gasto.getDataGasto());
                    novoGasto.setParcelado(true);
                    novoGasto.setParcelasTotal(gasto.getParcelasTotal());
                    novoGasto.setParcelasRestantes(gasto.getParcelasRestantes() - 1);
                    novoGasto.setValorTotal(gasto.getValorTotal());
                    gastoRepository.save(novoGasto);
                } else {
                    // Marcar como faturado
                    gasto.setFaturado(true);
                    gasto.setFatura(fatura);
                    gastoRepository.save(gasto);
                }
            }
            
            return ResponseEntity.ok(Map.of("success", true, "faturaId", fatura.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/historico/{cartaoId}")
    public List<Fatura> listarHistorico(@PathVariable Long cartaoId) {
        return faturaRepository.findByCartaoIdOrderByDataFechamentoDesc(cartaoId);
    }
    
    @GetMapping("/gastos-fatura/{faturaId}")
    public ResponseEntity<?> listarGastosFatura(@PathVariable Long faturaId) {
        try {
            var gastos = gastoRepository.findByFaturaIdOrderByDataGastoDesc(faturaId);
            var gastosMap = gastos.stream().map(gasto -> {
                var map = new java.util.HashMap<String, Object>();
                map.put("id", gasto.getId());
                map.put("valor", gasto.getValor());
                map.put("estabelecimento", gasto.getEstabelecimento());
                map.put("categoria", gasto.getCategoria().getNome());
                map.put("dataGasto", gasto.getDataGasto());
                map.put("parcelado", gasto.isParcelado());
                map.put("parcelasTotal", gasto.getParcelasTotal() != null ? gasto.getParcelasTotal() : 0);
                map.put("valorTotal", gasto.getValorTotal() != null ? gasto.getValorTotal() : gasto.getValor());
                return map;
            }).toList();
            return ResponseEntity.ok(gastosMap);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}