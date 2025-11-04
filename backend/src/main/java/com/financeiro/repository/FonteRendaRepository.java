package com.financeiro.repository;

import com.financeiro.model.FonteRenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FonteRendaRepository extends JpaRepository<FonteRenda, Long> {
}
