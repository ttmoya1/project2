package com.gustavo.bolsaempleo.repository;

import com.gustavo.bolsaempleo.model.Oferente;
import com.gustavo.bolsaempleo.model.Postulacion;
import com.gustavo.bolsaempleo.model.Puesto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostulacionRepository extends JpaRepository<Postulacion, Integer> {

    boolean existsByOferenteAndPuesto(Oferente oferente, Puesto puesto);

    // Todos los que aplicaron a un puesto
    List<Postulacion> findByPuestoId(Integer puestoId);
}