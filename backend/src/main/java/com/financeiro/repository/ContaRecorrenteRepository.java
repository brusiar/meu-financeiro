package com.financeiro.repository;

import com.financeiro.model.ContaRecorrente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContaRecorrenteRepository extends JpaRepository<ContaRecorrente, Long> {
    List<ContaRecorrente> findByUsuarioUsernameOrderByNomeAsc(String username);
}
