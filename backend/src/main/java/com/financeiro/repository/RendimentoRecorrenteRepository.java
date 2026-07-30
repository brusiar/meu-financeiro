package com.financeiro.repository;

import com.financeiro.model.RendimentoRecorrente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RendimentoRecorrenteRepository extends JpaRepository<RendimentoRecorrente, Long> {
    List<RendimentoRecorrente> findByUsuarioUsernameOrderByNomeAsc(String username);
}
