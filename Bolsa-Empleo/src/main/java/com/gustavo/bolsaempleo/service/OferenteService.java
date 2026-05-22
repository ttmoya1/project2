package com.gustavo.bolsaempleo.service;

import com.gustavo.bolsaempleo.dto.OferenteHabilidadRequest;
import com.gustavo.bolsaempleo.dto.OferenteRequest;
import com.gustavo.bolsaempleo.model.*;
import com.gustavo.bolsaempleo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OferenteService {

    private final OferenteRepository oferenteRepository;
    private final UsuarioRepository usuarioRepository;
    private final CaracteristicaRepository caracteristicaRepository;
    private final OferenteCaracteristicaRepository oferenteCaracteristicaRepository;
    private final PasswordEncoder passwordEncoder;

    // Registro de nuevo oferente
    @Transactional
    public Oferente registrar(OferenteRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }
        if (oferenteRepository.existsByIdentificacion(request.getIdentificacion())) {
            throw new RuntimeException("La identificación ya está registrada");
        }

        Usuario usuario = new Usuario();
        usuario.setCorreo(request.getCorreo());
        usuario.setClave(passwordEncoder.encode(request.getClave()));
        usuario.setRol(Usuario.Rol.OFERENTE);
        usuario.setActivo(false);
        usuarioRepository.save(usuario);

        Oferente oferente = new Oferente();
        oferente.setUsuario(usuario);
        oferente.setIdentificacion(request.getIdentificacion());
        oferente.setNombre(request.getNombre());
        oferente.setPrimerApellido(request.getPrimerApellido());
        oferente.setNacionalidad(request.getNacionalidad());
        oferente.setTelefono(request.getTelefono());
        oferente.setLugarResidencia(request.getLugarResidencia());
        oferente.setAprobado(false);
        return oferenteRepository.save(oferente);
    }

    // Obtener oferente por usuario logueado
    public Oferente getByUsuarioCorreo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return oferenteRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Oferente no encontrado"));
    }

    // Listar oferentes pendientes
    public List<Oferente> getPendientes() {
        return oferenteRepository.findByAprobadoFalse();
    }

    // Aprobar oferente
    @Transactional
    public Oferente aprobar(Integer id) {
        Oferente oferente = oferenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferente no encontrado"));
        oferente.setAprobado(true);
        oferente.getUsuario().setActivo(true);
        usuarioRepository.save(oferente.getUsuario());
        return oferenteRepository.save(oferente);
    }

    // Actualizar habilidades del oferente
    @Transactional
    public void actualizarHabilidades(String correo, OferenteHabilidadRequest request) {
        Oferente oferente = getByUsuarioCorreo(correo);

        // Eliminar habilidades anteriores
        List<OferenteCaracteristica> anteriores = oferenteCaracteristicaRepository
                .findByOferenteId(oferente.getId());
        oferenteCaracteristicaRepository.deleteAll(anteriores);

        // Guardar nuevas habilidades
        for (OferenteHabilidadRequest.HabilidadDTO h : request.getHabilidades()) {
            Caracteristica caracteristica = caracteristicaRepository.findById(h.getCaracteristicaId())
                    .orElseThrow(() -> new RuntimeException("Característica no encontrada"));

            OferenteCaracteristica oc = new OferenteCaracteristica();
            oc.setOferente(oferente);
            oc.setCaracteristica(caracteristica);
            oc.setNivel(h.getNivel());
            oferenteCaracteristicaRepository.save(oc);
        }
    }
}