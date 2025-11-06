package com.financeiro.repository;

import com.financeiro.model.Divida;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DividaRepository extends JpaRepository<Divida, Long> {
}
