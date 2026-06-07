package com.gustavo.bolsaempleo.service;

import com.gustavo.bolsaempleo.dto.CaracteristicaDTO;
import com.gustavo.bolsaempleo.model.Caracteristica;
import com.gustavo.bolsaempleo.repository.CaracteristicaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CaracteristicaService {

    private final CaracteristicaRepository caracteristicaRepository;


    @Transactional(readOnly = true)
    public List<CaracteristicaDTO> getArbol() {
        List<Caracteristica> raices = caracteristicaRepository.findByPadreIsNull();
        return raices.stream().map(this::toDTO).toList();
    }


    public Caracteristica crear(String nombre, Integer padreId) {
        Caracteristica c = new Caracteristica();
        c.setNombre(nombre);
        if (padreId != null) {
            Caracteristica padre = caracteristicaRepository.findById(padreId)
                    .orElseThrow(() -> new RuntimeException("Padre no encontrado"));
            c.setPadre(padre);
        }
        return caracteristicaRepository.save(c);
    }

    private CaracteristicaDTO toDTO(Caracteristica c) {
        CaracteristicaDTO dto = new CaracteristicaDTO();
        dto.setId(c.getId());
        dto.setNombre(c.getNombre());
        if (c.getHijos() != null) {
            dto.setHijos(c.getHijos().stream().map(this::toDTO).toList());
        }
        return dto;
    }
}