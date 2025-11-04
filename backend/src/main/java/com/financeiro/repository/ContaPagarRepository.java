package com.financeiro.repository;

import com.financeiro.model.ContaPagar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContaPagarRepository extends JpaRepository<ContaPagar, Long> {
    List<ContaPagar> findByUsuarioUsernameOrderByDataVencimentoAsc(String username);
    List<ContaPagar> findByUsuarioUsernameAndPagoFalseOrderByDataVencimentoAsc(String username);
    List<ContaPagar> findByUsuarioUsernameAndDataVencimentoBetweenOrderByDataVencimentoAsc(String username, LocalDate inicio, LocalDate fim);
}