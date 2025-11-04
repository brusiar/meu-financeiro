package com.financeiro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "cartoes_credito")
public class CartaoCredito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String apelido;

    @NotBlank
    private String banco;

    @NotBlank
    @Column(name = "ultimos_digitos")
    private String ultimosDigitos;

    private boolean ativo = true;

    @Column(name = "dia_fechamento")
    private Integer diaFechamento;

    @Column(name = "dia_vencimento")
    private Integer diaVencimento;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // Construtores
    public CartaoCredito() {}

    public CartaoCredito(String apelido, String banco, String ultimosDigitos, Usuario usuario) {
        this.apelido = apelido;
        this.banco = banco;
        this.ultimosDigitos = ultimosDigitos;
        this.usuario = usuario;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getApelido() { return apelido; }
    public void setApelido(String apelido) { this.apelido = apelido; }

    public String getBanco() { return banco; }
    public void setBanco(String banco) { this.banco = banco; }

    public String getUltimosDigitos() { return ultimosDigitos; }
    public void setUltimosDigitos(String ultimosDigitos) { this.ultimosDigitos = ultimosDigitos; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Integer getDiaFechamento() { return diaFechamento; }
    public void setDiaFechamento(Integer diaFechamento) { this.diaFechamento = diaFechamento; }

    public Integer getDiaVencimento() { return diaVencimento; }
    public void setDiaVencimento(Integer diaVencimento) { this.diaVencimento = diaVencimento; }
}