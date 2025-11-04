package com.financeiro.repository;

import com.financeiro.model.AcaoMesada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AcaoMesadaRepository extends JpaRepository<AcaoMesada, Long> {
}
