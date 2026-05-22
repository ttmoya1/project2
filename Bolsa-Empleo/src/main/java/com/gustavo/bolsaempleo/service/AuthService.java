package com.gustavo.bolsaempleo.service;

import com.gustavo.bolsaempleo.dto.LoginRequest;
import com.gustavo.bolsaempleo.dto.LoginResponse;
import com.gustavo.bolsaempleo.model.Usuario;
import com.gustavo.bolsaempleo.repository.UsuarioRepository;
import com.gustavo.bolsaempleo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        System.out.println(">>> Buscando usuario: " + request.getCorreo());

        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));


        if (!passwordEncoder.matches(request.getClave(), usuario.getClave())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        System.out.println(">>> Password OK");

        if (!usuario.getActivo()) {
            throw new RuntimeException("Usuario pendiente de aprobación");
        }

        String token = jwtUtil.generateToken(usuario.getCorreo(), usuario.getRol().name());
        return new LoginResponse(token, usuario.getRol().name(), usuario.getCorreo());
    }
}