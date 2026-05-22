package com.gustavo.bolsaempleo.repository;


import com.gustavo.bolsaempleo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByCorreo(String correo);
    Boolean existsByCorreo(String correo);
}