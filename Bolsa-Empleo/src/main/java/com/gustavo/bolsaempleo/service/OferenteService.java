package com.gustavo.bolsaempleo.service;

import com.gustavo.bolsaempleo.dto.CandidatoResponse;
import com.gustavo.bolsaempleo.dto.OferenteHabilidadRequest;
import com.gustavo.bolsaempleo.dto.OferenteRequest;
import com.gustavo.bolsaempleo.model.*;
import com.gustavo.bolsaempleo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
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

    // Directorio donde se guardan los CVs
    private static final String UPLOAD_DIR = "curriculos/";

    // ── Registro ──────────────────────────────────────────────────────────────
    @Transactional
    public Oferente registrar(OferenteRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo()))
            throw new RuntimeException("El correo ya está registrado");
        if (oferenteRepository.existsByIdentificacion(request.getIdentificacion()))
            throw new RuntimeException("La identificación ya está registrada");

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

    // ── Obtener oferente logueado ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public Oferente getByUsuarioCorreo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return oferenteRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Oferente no encontrado"));
    }

    // ── Pendientes / Aprobar / Rechazar ───────────────────────────────────────
    public List<Oferente> getPendientes() {
        return oferenteRepository.findByAprobadoFalse();
    }

    @Transactional
    public Oferente aprobar(Integer id) {
        Oferente oferente = oferenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferente no encontrado"));
        oferente.setAprobado(true);
        oferente.getUsuario().setActivo(true);
        usuarioRepository.save(oferente.getUsuario());
        return oferenteRepository.save(oferente);
    }

    @Transactional
    public void rechazar(Integer id) {
        Oferente oferente = oferenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oferente no encontrado"));
        oferenteRepository.delete(oferente);
    }

    // ── Habilidades ───────────────────────────────────────────────────────────
    @Transactional
    public void actualizarHabilidades(String correo, OferenteHabilidadRequest request) {
        Oferente oferente = getByUsuarioCorreo(correo);
        List<OferenteCaracteristica> anteriores =
                oferenteCaracteristicaRepository.findByOferenteId(oferente.getId());
        oferenteCaracteristicaRepository.deleteAll(anteriores);

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

    // ── Currículo PDF ─────────────────────────────────────────────────────────

    @Transactional
    public void subirCurriculo(String correo, MultipartFile archivo) {
        if (archivo.isEmpty())
            throw new RuntimeException("El archivo está vacío");
        if (!Objects.requireNonNull(archivo.getContentType()).equals("application/pdf"))
            throw new RuntimeException("Solo se aceptan archivos PDF");

        Oferente oferente = getByUsuarioCorreo(correo);

        try {
            // Crear directorio si no existe
            Path dir = Paths.get(UPLOAD_DIR);
            if (!Files.exists(dir)) Files.createDirectories(dir);

            // Nombre único por oferente: curriculo_{id}.pdf
            String nombreArchivo = "curriculo_" + oferente.getId() + ".pdf";
            Path destino = dir.resolve(nombreArchivo);
            Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

            // Guardar ruta en BD
            oferente.setCurriculumPdf(nombreArchivo);
            oferenteRepository.save(oferente);

        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo: " + e.getMessage());
        }
    }

    public Resource getCurriculo(String correo) {
        Oferente oferente = getByUsuarioCorreo(correo);
        return cargarArchivo(oferente.getCurriculumPdf());
    }

    public Resource getCurriculoPorId(Integer oferenteId) {
        Oferente oferente = oferenteRepository.findById(oferenteId)
                .orElseThrow(() -> new RuntimeException("Oferente no encontrado"));
        return cargarArchivo(oferente.getCurriculumPdf());
    }

    private Resource cargarArchivo(String nombreArchivo) {
        if (nombreArchivo == null || nombreArchivo.isBlank())
            throw new RuntimeException("Este oferente no tiene currículo subido");
        try {
            Path ruta = Paths.get(UPLOAD_DIR).resolve(nombreArchivo);
            Resource resource = new UrlResource(ruta.toUri());
            if (!resource.exists())
                throw new RuntimeException("Archivo no encontrado en el servidor");
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error al leer el archivo");
        }
    }

    // ── Candidatos ────────────────────────────────────────────────────────────
    public List<CandidatoResponse> buscarCandidatosPorPuesto(Integer puestoId) {
        puestoRepository.findById(puestoId)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado"));

        List<PuestoCaracteristica> requisitos =
                puestoCaracteristicaRepository.findByPuestoId(puestoId);
        if (requisitos.isEmpty()) return List.of();

        Set<Integer> candidatosIds = null;
        for (PuestoCaracteristica req : requisitos) {
            List<Oferente> candidatos = oferenteCaracteristicaRepository
                    .buscarOferentesPorHabilidad(
                            req.getCaracteristica().getId(),
                            req.getNivelRequerido());
            Set<Integer> ids = candidatos.stream().map(Oferente::getId).collect(Collectors.toSet());
            if (candidatosIds == null) candidatosIds = new HashSet<>(ids);
            else candidatosIds.retainAll(ids);
        }

        if (candidatosIds == null || candidatosIds.isEmpty()) return List.of();

        List<CandidatoResponse> resultado = new ArrayList<>();
        for (Integer oid : candidatosIds) {
            Oferente o = oferenteRepository.findById(oid).orElse(null);
            if (o == null) continue;
            resultado.add(buildCandidatoResponse(o));
        }
        return resultado;
    }

    @Transactional(readOnly = true)
    public CandidatoResponse getDetalleCandidato(Integer oferenteId) {
        Oferente o = oferenteRepository.findById(oferenteId)
                .orElseThrow(() -> new RuntimeException("Oferente no encontrado"));
        return buildCandidatoResponse(o);
    }

    private CandidatoResponse buildCandidatoResponse(Oferente o) {
        List<OferenteCaracteristica> habilidades =
                oferenteCaracteristicaRepository.findByOferenteId(o.getId());

        CandidatoResponse cr = new CandidatoResponse();
        cr.setId(o.getId());
        cr.setNombre(o.getNombre());
        cr.setPrimerApellido(o.getPrimerApellido());
        cr.setIdentificacion(o.getIdentificacion());
        cr.setNacionalidad(o.getNacionalidad());
        cr.setTelefono(o.getTelefono());
        cr.setLugarResidencia(o.getLugarResidencia());
        cr.setCorreo(o.getUsuario().getCorreo());
        cr.setTieneCurriculo(o.getCurriculumPdf() != null && !o.getCurriculumPdf().isBlank());

        cr.setHabilidades(habilidades.stream().map(h -> {
            CandidatoResponse.HabilidadDTO hd = new CandidatoResponse.HabilidadDTO();
            hd.setCaracteristicaId(h.getCaracteristica().getId());
            hd.setCaracteristicaNombre(h.getCaracteristica().getNombre());
            hd.setNivel(h.getNivel());
            return hd;
        }).toList());

        return cr;
    }

    public List<Oferente> getTodos() {
        return oferenteRepository.findAll();
    }
}