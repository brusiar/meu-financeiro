package com.financeiro.service;

import com.financeiro.model.FonteRenda;
import com.financeiro.model.HistoricoRendimento;
import com.financeiro.repository.FonteRendaRepository;
import com.financeiro.repository.HistoricoRendimentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RendimentoService {

    @Autowired
    private FonteRendaRepository rendaRepository;

    @Autowired
    private HistoricoRendimentoRepository historicoRepository;

    @Scheduled(cron = "0 0 1 1 * ?")
    public void gerarRendimentosMensais() {
        LocalDate hoje = LocalDate.now();
        List<FonteRenda> rendas = rendaRepository.findAll().stream()
            .filter(FonteRenda::isRecorrente)
            .toList();

        for (FonteRenda renda : rendas) {
            LocalDate dataRecebimento = hoje.withDayOfMonth(
                Math.min(renda.getDiaRecebimento(), hoje.lengthOfMonth())
            );

            HistoricoRendimento historico = new HistoricoRendimento();
            historico.setDescricao(renda.getDescricao());
            historico.setValor(renda.getValor());
            historico.setDataRecebimento(dataRecebimento);
            historico.setMesReferencia(hoje.getMonthValue());
            historico.setAnoReferencia(hoje.getYear());
            historico.setFonteRenda(renda);
            historico.setUsuario(renda.getUsuario());

            historicoRepository.save(historico);
        }
    }
}
