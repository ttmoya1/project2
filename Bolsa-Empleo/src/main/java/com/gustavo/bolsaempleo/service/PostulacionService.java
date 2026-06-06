package com.gustavo.bolsaempleo.service;

import com.gustavo.bolsaempleo.model.Oferente;
import com.gustavo.bolsaempleo.model.Postulacion;
import com.gustavo.bolsaempleo.model.Puesto;
import com.gustavo.bolsaempleo.repository.OferenteRepository;
import com.gustavo.bolsaempleo.repository.PostulacionRepository;
import com.gustavo.bolsaempleo.repository.PuestoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PostulacionService {

    private final PostulacionRepository postulacionRepository;
    private final OferenteRepository oferenteRepository;
    private final PuestoRepository puestoRepository;

    public void postular(
            Integer oferenteId,
            Integer puestoId
    ) {

        Oferente oferente = oferenteRepository
                .findById(oferenteId)
                .orElseThrow();

        Puesto puesto = puestoRepository
                .findById(puestoId)
                .orElseThrow();

        if (postulacionRepository
                .existsByOferenteAndPuesto(
                        oferente,
                        puesto
                )) {

            throw new RuntimeException(
                    "Ya aplicó a este puesto"
            );
        }

        Postulacion postulacion = new Postulacion();

        postulacion.setOferente(oferente);
        postulacion.setPuesto(puesto);
        postulacion.setFechaPostulacion(
                LocalDateTime.now()
        );

        postulacionRepository.save(postulacion);
    }
}