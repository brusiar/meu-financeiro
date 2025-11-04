package com.financeiro.repository;

import com.financeiro.model.HistoricoRendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoricoRendimentoRepository extends JpaRepository<HistoricoRendimento, Long> {
}
