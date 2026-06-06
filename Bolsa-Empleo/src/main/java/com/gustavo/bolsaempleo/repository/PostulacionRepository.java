package com.gustavo.bolsaempleo.repository;

import com.gustavo.bolsaempleo.model.Oferente;
import com.gustavo.bolsaempleo.model.Postulacion;
import com.gustavo.bolsaempleo.model.Puesto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostulacionRepository
        extends JpaRepository<Postulacion, Integer> {

    boolean existsByOferenteAndPuesto(
            Oferente oferente,
            Puesto puesto
    );
}