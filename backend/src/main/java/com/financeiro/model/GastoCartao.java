package com.financeiro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "gastos_cartao")
public class GastoCartao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Positive
    @Column(precision = 10, scale = 2)
    private BigDecimal valor;

    @NotBlank
    private String estabelecimento;

    @ManyToOne
    @JoinColumn(name = "cartao_id")
    private CartaoCredito cartao;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(name = "data_gasto")
    private LocalDateTime dataGasto = LocalDateTime.now();

    private boolean parcelado = false;
    
    @Column(name = "parcelas_total")
    private Integer parcelasTotal;
    
    @Column(name = "parcelas_restantes")
    private Integer parcelasRestantes;
    
    @Column(name = "valor_total", precision = 10, scale = 2)
    private BigDecimal valorTotal;

    private boolean faturado = false;

    @ManyToOne
    @JoinColumn(name = "fatura_id")
    private Fatura fatura;

    // Construtores
    public GastoCartao() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public String getEstabelecimento() { return estabelecimento; }
    public void setEstabelecimento(String estabelecimento) { this.estabelecimento = estabelecimento; }

    public CartaoCredito getCartao() { return cartao; }
    public void setCartao(CartaoCredito cartao) { this.cartao = cartao; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public LocalDateTime getDataGasto() { return dataGasto; }
    public void setDataGasto(LocalDateTime dataGasto) { this.dataGasto = dataGasto; }

    public boolean isParcelado() { return parcelado; }
    public void setParcelado(boolean parcelado) { this.parcelado = parcelado; }

    public Integer getParcelasTotal() { return parcelasTotal; }
    public void setParcelasTotal(Integer parcelasTotal) { this.parcelasTotal = parcelasTotal; }

    public Integer getParcelasRestantes() { return parcelasRestantes; }
    public void setParcelasRestantes(Integer parcelasRestantes) { this.parcelasRestantes = parcelasRestantes; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public boolean isFaturado() { return faturado; }
    public void setFaturado(boolean faturado) { this.faturado = faturado; }

    public Fatura getFatura() { return fatura; }
    public void setFatura(Fatura fatura) { this.fatura = fatura; }
}