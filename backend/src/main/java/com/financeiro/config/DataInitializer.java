package com.financeiro.config;

import com.financeiro.model.Categoria;
import com.financeiro.repository.CategoriaRepository;
import com.financeiro.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Override
    public void run(String... args) throws Exception {
        // Cria usuário padrão se não existir
        if (!usuarioService.buscarPorUsername("admin").isPresent()) {
            usuarioService.criarUsuario("admin", "admin@financeiro.com", "admin123");
            System.out.println("Usuário admin criado com sucesso!");
        }

        // Cria categorias padrão se não existirem
        if (categoriaRepository.count() == 0) {
            String[] categoriasDefault = {
                "Alimentação", "Transporte", "Saúde", "Educação", 
                "Lazer", "Vestuário", "Casa", "Cartão de Crédito", "Outros"
            };
            
            for (String nome : categoriasDefault) {
                Categoria categoria = new Categoria();
                categoria.setNome(nome);
                categoria.setTipo(Categoria.TipoCategoria.DESPESA);
                categoriaRepository.save(categoria);
            }
            System.out.println("Categorias padrão criadas com sucesso!");
        }
    }
}