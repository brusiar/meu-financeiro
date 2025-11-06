package com.financeiro.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "dividas")
public class Divida {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String instituicao;
    private BigDecimal valorTotal;
    private BigDecimal taxaJuros;
    
    @Enumerated(EnumType.STRING)
    private TipoTaxa tipoTaxa;
    
    private BigDecimal saldoDevedor;
    private LocalDate dataCadastro;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    public enum TipoTaxa {
        MENSAL, ANUAL
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInstituicao() { return instituicao; }
    public void setInstituicao(String instituicao) { this.instituicao = instituicao; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public BigDecimal getTaxaJuros() { return taxaJuros; }
    public void setTaxaJuros(BigDecimal taxaJuros) { this.taxaJuros = taxaJuros; }

    public TipoTaxa getTipoTaxa() { return tipoTaxa; }
    public void setTipoTaxa(TipoTaxa tipoTaxa) { this.tipoTaxa = tipoTaxa; }

    public BigDecimal getSaldoDevedor() { return saldoDevedor; }
    public void setSaldoDevedor(BigDecimal saldoDevedor) { this.saldoDevedor = saldoDevedor; }

    public LocalDate getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDate dataCadastro) { this.dataCadastro = dataCadastro; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
}
