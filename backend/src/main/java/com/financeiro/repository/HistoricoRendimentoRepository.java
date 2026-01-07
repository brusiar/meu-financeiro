package com.financeiro.repository;

import com.financeiro.model.HistoricoRendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface HistoricoRendimentoRepository extends JpaRepository<HistoricoRendimento, Long> {
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM historico_rendimentos WHERE fonte_renda_id = :fonteRendaId", nativeQuery = true)
    void deleteByFonteRendaId(Long fonteRendaId);
}
