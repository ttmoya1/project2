package com.gustavo.bolsaempleo.service;

import com.gustavo.bolsaempleo.dto.PuestoRequest;
import com.gustavo.bolsaempleo.dto.PuestoResponse;
import com.gustavo.bolsaempleo.model.*;
import com.gustavo.bolsaempleo.repository.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PuestoService {

    private final PuestoRepository puestoRepository;
    private final EmpresaRepository empresaRepository;
    private final CaracteristicaRepository caracteristicaRepository;
    private final PuestoCaracteristicaRepository puestoCaracteristicaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntityManager entityManager;

    @Transactional
    public Puesto publicar(String correoEmpresa, PuestoRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(correoEmpresa)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Empresa empresa = empresaRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        Puesto puesto = new Puesto();
        puesto.setEmpresa(empresa);
        puesto.setDescripcion(request.getDescripcion());
        puesto.setSalario(request.getSalario());
        puesto.setTipo(Puesto.TipoPuesto.valueOf(request.getTipo()));
        puesto.setActivo(true);
        puestoRepository.save(puesto);

        for (PuestoRequest.CaracteristicaNivelDTO c : request.getCaracteristicas()) {
            Caracteristica caracteristica = caracteristicaRepository.findById(c.getCaracteristicaId())
                    .orElseThrow(() -> new RuntimeException("Característica no encontrada"));
            PuestoCaracteristica pc = new PuestoCaracteristica();
            pc.setPuesto(puesto);
            pc.setCaracteristica(caracteristica);
            pc.setNivelRequerido(c.getNivelRequerido());
            puestoCaracteristicaRepository.save(pc);
        }
        return puesto;
    }

    @Transactional(readOnly = true)
    public List<PuestoResponse> getPublicosRecientes() {
        List<Puesto> puestos = puestoRepository
                .findTop5ByTipoAndActivoTrueOrderByFechaRegistroDesc(Puesto.TipoPuesto.PUBLICO);
        return puestos.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PuestoResponse> getMisPuestos(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Empresa empresa = empresaRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        return puestoRepository.findByEmpresaId(empresa.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PuestoResponse> buscar(List<Integer> caracteristicaIds) {
        return puestoRepository.buscarPorCaracteristicas(caracteristicaIds, Puesto.TipoPuesto.PUBLICO)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void hacerPrivado(Integer puestoId, String correo) {
        Puesto puesto = getPuestoVerificado(puestoId, correo);
        puesto.setTipo(Puesto.TipoPuesto.PRIVADO);
        puestoRepository.save(puesto);
    }

    @Transactional
    public void hacerPublico(Integer puestoId, String correo) {
        Puesto puesto = getPuestoVerificado(puestoId, correo);
        puesto.setTipo(Puesto.TipoPuesto.PUBLICO);
        puestoRepository.save(puesto);
    }

    @Transactional
    public void desactivar(Integer puestoId, String correo) {
        Puesto puesto = getPuestoVerificado(puestoId, correo);
        puesto.setActivo(false);
        puestoRepository.save(puesto);
    }

    private Puesto getPuestoVerificado(Integer puestoId, String correo) {
        Puesto puesto = puestoRepository.findById(puestoId)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado"));
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Empresa empresa = empresaRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        if (!puesto.getEmpresa().getId().equals(empresa.getId())) {
            throw new RuntimeException("No tenés permiso sobre este puesto");
        }
        return puesto;
    }

    private PuestoResponse toResponse(Puesto puesto) {
        PuestoResponse response = new PuestoResponse();
        response.setId(puesto.getId());
        response.setEmpresaNombre(puesto.getEmpresa().getNombre());
        response.setDescripcion(puesto.getDescripcion());
        response.setSalario(puesto.getSalario());
        response.setTipo(puesto.getTipo().name());
        response.setActivo(puesto.getActivo());
        response.setFechaRegistro(puesto.getFechaRegistro());

        List<PuestoCaracteristica> pcs = puestoCaracteristicaRepository.findByPuestoId(puesto.getId());
        List<PuestoResponse.CaracteristicaNivelDTO> cars = new ArrayList<>();
        for (PuestoCaracteristica pc : pcs) {
            PuestoResponse.CaracteristicaNivelDTO dto = new PuestoResponse.CaracteristicaNivelDTO();
            dto.setCaracteristicaId(pc.getCaracteristica().getId());
            dto.setCaracteristicaNombre(pc.getCaracteristica().getNombre());
            dto.setNivelRequerido(pc.getNivelRequerido());
            cars.add(dto);
        }
        response.setCaracteristicas(cars);
        return response;
    }

    @Transactional(readOnly = true)
    public PuestoResponse getById(Integer id) {
        Puesto puesto = puestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado"));
        return toResponse(puesto);
    }

    @Transactional
    public PuestoResponse editar(Integer puestoId, String correoEmpresa, PuestoRequest request) {
        getPuestoVerificado(puestoId, correoEmpresa);

        puestoCaracteristicaRepository.deleteByPuestoId(puestoId);
        entityManager.flush();
        entityManager.clear();

        Puesto puesto = puestoRepository.findById(puestoId)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado"));

        puesto.setDescripcion(request.getDescripcion());
        puesto.setSalario(request.getSalario());
        puesto.setTipo(Puesto.TipoPuesto.valueOf(request.getTipo()));
        puestoRepository.save(puesto);

        for (PuestoRequest.CaracteristicaNivelDTO c : request.getCaracteristicas()) {
            Caracteristica caracteristica = caracteristicaRepository
                    .findById(c.getCaracteristicaId())
                    .orElseThrow(() -> new RuntimeException("Característica no encontrada"));
            PuestoCaracteristica pc = new PuestoCaracteristica();
            pc.setPuesto(puesto);
            pc.setCaracteristica(caracteristica);
            pc.setNivelRequerido(c.getNivelRequerido());
            puestoCaracteristicaRepository.save(pc);
        }

        entityManager.flush();
        entityManager.clear();

        return toResponse(puestoRepository.findById(puestoId)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado")));
    }
}