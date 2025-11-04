package com.financeiro.repository;

import com.financeiro.model.Fatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaturaRepository extends JpaRepository<Fatura, Long> {
    List<Fatura> findByCartaoIdOrderByDataFechamentoDesc(Long cartaoId);
}