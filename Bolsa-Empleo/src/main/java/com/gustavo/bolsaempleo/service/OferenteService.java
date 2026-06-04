package com.gustavo.bolsaempleo.service;

import com.gustavo.bolsaempleo.dto.CandidatoResponse;
import com.gustavo.bolsaempleo.dto.OferenteHabilidadRequest;
import com.gustavo.bolsaempleo.dto.OferenteRequest;
import com.gustavo.bolsaempleo.model.*;
import com.gustavo.bolsaempleo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OferenteService {

    private final OferenteRepository oferenteRepository;
    private final UsuarioRepository usuarioRepository;
    private final CaracteristicaRepository caracteristicaRepository;
    private final OferenteCaracteristicaRepository oferenteCaracteristicaRepository;
    private final PuestoRepository puestoRepository;
    private final PuestoCaracteristicaRepository puestoCaracteristicaRepository;
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

    /**
     * Buscar candidatos cuyas habilidades coincidan con las características
     * requeridas por un puesto, al menos con el nivel indicado.
     * Requerimiento: empresa puede buscar candidatos para un puesto publicado.
     */
    public List<CandidatoResponse> buscarCandidatosPorPuesto(Integer puestoId) {
        Puesto puesto = puestoRepository.findById(puestoId)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado"));

        List<PuestoCaracteristica> requisitos = puestoCaracteristicaRepository
                .findByPuestoId(puestoId);

        if (requisitos.isEmpty()) {
            return List.of();
        }

        // Buscar oferentes que cumplan con CADA característica requerida
        // Usamos intersección: el candidato debe aparecer en todos los sets
        Set<Integer> candidatosIds = null;
        Map<Integer, List<OferenteCaracteristica>> habilidadesPorOferente = new HashMap<>();

        for (PuestoCaracteristica req : requisitos) {
            List<Oferente> candidatos = oferenteCaracteristicaRepository
                    .buscarOferentesPorHabilidad(
                            req.getCaracteristica().getId(),
                            req.getNivelRequerido()
                    );

            Set<Integer> idsEstaCaracteristica = candidatos.stream()
                    .map(Oferente::getId)
                    .collect(Collectors.toSet());

            if (candidatosIds == null) {
                candidatosIds = new HashSet<>(idsEstaCaracteristica);
            } else {
                // Intersección: solo los que cumplen TODAS las características
                candidatosIds.retainAll(idsEstaCaracteristica);
            }
        }

        if (candidatosIds == null || candidatosIds.isEmpty()) {
            return List.of();
        }

        // Construir respuesta con los candidatos que pasaron el filtro
        List<CandidatoResponse> resultado = new ArrayList<>();
        for (Integer oid : candidatosIds) {
            Oferente o = oferenteRepository.findById(oid).orElse(null);
            if (o == null) continue;

            List<OferenteCaracteristica> habilidades =
                    oferenteCaracteristicaRepository.findByOferenteId(oid);

            CandidatoResponse cr = new CandidatoResponse();
            cr.setId(o.getId());
            cr.setNombre(o.getNombre());
            cr.setPrimerApellido(o.getPrimerApellido());
            cr.setIdentificacion(o.getIdentificacion());
            cr.setNacionalidad(o.getNacionalidad());
            cr.setTelefono(o.getTelefono());
            cr.setLugarResidencia(o.getLugarResidencia());
            cr.setCorreo(o.getUsuario().getCorreo());

            List<CandidatoResponse.HabilidadDTO> habs = habilidades.stream().map(h -> {
                CandidatoResponse.HabilidadDTO hd = new CandidatoResponse.HabilidadDTO();
                hd.setCaracteristicaId(h.getCaracteristica().getId());
                hd.setCaracteristicaNombre(h.getCaracteristica().getNombre());
                hd.setNivel(h.getNivel());
                return hd;
            }).toList();

            cr.setHabilidades(habs);
            resultado.add(cr);
        }

        return resultado;
    }

    // Convertir Oferente a CandidatoResponse (para ver detalle individual)
    public CandidatoResponse getDetalleCandidato(Integer oferenteId) {
        Oferente o = oferenteRepository.findById(oferenteId)
                .orElseThrow(() -> new RuntimeException("Oferente no encontrado"));

        List<OferenteCaracteristica> habilidades =
                oferenteCaracteristicaRepository.findByOferenteId(oferenteId);

        CandidatoResponse cr = new CandidatoResponse();
        cr.setId(o.getId());
        cr.setNombre(o.getNombre());
        cr.setPrimerApellido(o.getPrimerApellido());
        cr.setIdentificacion(o.getIdentificacion());
        cr.setNacionalidad(o.getNacionalidad());
        cr.setTelefono(o.getTelefono());
        cr.setLugarResidencia(o.getLugarResidencia());
        cr.setCorreo(o.getUsuario().getCorreo());

        List<CandidatoResponse.HabilidadDTO> habs = habilidades.stream().map(h -> {
            CandidatoResponse.HabilidadDTO hd = new CandidatoResponse.HabilidadDTO();
            hd.setCaracteristicaId(h.getCaracteristica().getId());
            hd.setCaracteristicaNombre(h.getCaracteristica().getNombre());
            hd.setNivel(h.getNivel());
            return hd;
        }).toList();

        cr.setHabilidades(habs);
        return cr;
    }
}