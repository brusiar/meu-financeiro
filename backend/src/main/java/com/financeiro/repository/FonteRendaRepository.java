package com.financeiro.repository;

import com.financeiro.model.FonteRenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FonteRendaRepository extends JpaRepository<FonteRenda, Long> {
    @Modifying
    @Query("UPDATE FonteRenda f SET f.rendimentoRecorrente = null WHERE f.rendimentoRecorrente.id = :id")
    void desvincularPagador(Long id);
}
