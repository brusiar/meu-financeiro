package com.financeiro.repository;

import com.financeiro.model.PagamentoDivida;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagamentoDividaRepository extends JpaRepository<PagamentoDivida, Long> {
}
