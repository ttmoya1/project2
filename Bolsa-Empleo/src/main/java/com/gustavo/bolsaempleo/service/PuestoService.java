package com.gustavo.bolsaempleo.service;

import com.gustavo.bolsaempleo.dto.PuestoRequest;
import com.gustavo.bolsaempleo.dto.PuestoResponse;
import com.gustavo.bolsaempleo.model.*;
import com.gustavo.bolsaempleo.repository.*;
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

    // Publicar nuevo puesto
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

    // 5 puestos públicos más recientes — FIX: @Transactional para que caracteristicas cargue
    @Transactional(readOnly = true)
    public List<PuestoResponse> getPublicosRecientes() {
        List<Puesto> puestos = puestoRepository
                .findTop5ByTipoAndActivoTrueOrderByFechaRegistroDesc(Puesto.TipoPuesto.PUBLICO);
        return puestos.stream().map(this::toResponse).toList();
    }

    // Puestos de la empresa logueada — FIX: @Transactional
    @Transactional(readOnly = true)
    public List<PuestoResponse> getMisPuestos(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Empresa empresa = empresaRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        return puestoRepository.findByEmpresaIdAndActivoTrue(empresa.getId())
                .stream().map(this::toResponse).toList();
    }

    // Buscar puestos públicos por características — FIX: @Transactional
    @Transactional(readOnly = true)
    public List<PuestoResponse> buscar(List<Integer> caracteristicaIds) {
        return puestoRepository.buscarPorCaracteristicas(caracteristicaIds, Puesto.TipoPuesto.PUBLICO)
                .stream().map(this::toResponse).toList();
    }

    // Desactivar puesto
    @Transactional
    public void desactivar(Integer puestoId, String correo) {
        Puesto puesto = puestoRepository.findById(puestoId)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado"));
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Empresa empresa = empresaRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        if (!puesto.getEmpresa().getId().equals(empresa.getId())) {
            throw new RuntimeException("No tienes permiso para desactivar este puesto");
        }
        puesto.setActivo(false);
        puestoRepository.save(puesto);
    }

    // Convertir Puesto a PuestoResponse
    private PuestoResponse toResponse(Puesto puesto) {
        PuestoResponse response = new PuestoResponse();
        response.setId(puesto.getId());
        response.setEmpresaNombre(puesto.getEmpresa().getNombre());
        response.setDescripcion(puesto.getDescripcion());
        response.setSalario(puesto.getSalario());
        response.setTipo(puesto.getTipo().name());
        response.setActivo(puesto.getActivo());
        response.setFechaRegistro(puesto.getFechaRegistro());

        List<PuestoResponse.CaracteristicaNivelDTO> cars = new ArrayList<>();
        for (PuestoCaracteristica pc : puesto.getCaracteristicas()) {
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

        Puesto puesto = puestoRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado"));

        return toResponse(puesto);
    }
}