package com.gustavo.bolsaempleo.service;

import com.gustavo.bolsaempleo.dto.EmpresaRequest;
import com.gustavo.bolsaempleo.model.Empresa;
import com.gustavo.bolsaempleo.model.Usuario;
import com.gustavo.bolsaempleo.repository.EmpresaRepository;
import com.gustavo.bolsaempleo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // Registro de nueva empresa
    @Transactional
    public Empresa registrar(EmpresaRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setCorreo(request.getCorreo());
        usuario.setClave(passwordEncoder.encode(request.getClave()));
        usuario.setRol(Usuario.Rol.EMPRESA);
        usuario.setActivo(false);
        usuarioRepository.save(usuario);

        Empresa empresa = new Empresa();
        empresa.setUsuario(usuario);
        empresa.setNombre(request.getNombre());
        empresa.setLocalizacion(request.getLocalizacion());
        empresa.setTelefono(request.getTelefono());
        empresa.setDescripcion(request.getDescripcion());
        empresa.setAprobada(false);
        return empresaRepository.save(empresa);
    }

    // Obtener empresa por usuario logueado
    public Empresa getByUsuarioCorreo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return empresaRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
    }

    // Listar empresas pendientes de aprobación
    public List<Empresa> getPendientes() {
        return empresaRepository.findByAprobadaFalse();
    }

    // Aprobar empresa
    @Transactional
    public Empresa aprobar(Integer id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        empresa.setAprobada(true);
        empresa.getUsuario().setActivo(true);
        usuarioRepository.save(empresa.getUsuario());
        return empresaRepository.save(empresa);
    }

    @Transactional
    public void rechazar(Integer id) {

        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        empresaRepository.delete(empresa);
    }

    public List<Empresa> getTodas() {
        return empresaRepository.findAll();
    }
}