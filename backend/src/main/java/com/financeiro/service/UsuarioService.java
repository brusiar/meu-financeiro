package com.financeiro.service;

import com.financeiro.model.Usuario;
import com.financeiro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario criarUsuario(String username, String email, String password) {
        if (usuarioRepository.existsByUsername(username)) {
            throw new RuntimeException("Username já existe");
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("Email já existe");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(password));

        return usuarioRepository.save(usuario);
    }

    public boolean autenticar(String username, String password) {
        Optional<Usuario> usuario = usuarioRepository.findByUsername(username);
        return usuario.isPresent() && passwordEncoder.matches(password, usuario.get().getPassword());
    }

    public Optional<Usuario> buscarPorUsername(String username) {
        return usuarioRepository.findByUsername(username);
    }

    public boolean alterarSenha(String username, String senhaAtual, String novaSenha) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (passwordEncoder.matches(senhaAtual, usuario.getPassword())) {
                usuario.setPassword(passwordEncoder.encode(novaSenha));
                usuarioRepository.save(usuario);
                return true;
            }
        }
        return false;
    }
}