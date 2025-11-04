package com.financeiro.repository;

import com.financeiro.model.GastoCartao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GastoCartaoRepository extends JpaRepository<GastoCartao, Long> {
    List<GastoCartao> findByCartaoIdAndFaturadoFalseOrderByDataGastoDesc(Long cartaoId);
    List<GastoCartao> findByCartaoIdOrderByDataGastoDesc(Long cartaoId);
    List<GastoCartao> findByFaturaIdOrderByDataGastoDesc(Long faturaId);
}