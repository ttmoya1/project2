package com.gustavo.bolsaempleo.repository;

import com.gustavo.bolsaempleo.model.PuestoCaracteristica;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PuestoCaracteristicaRepository extends JpaRepository<PuestoCaracteristica, Integer> {
    List<PuestoCaracteristica> findByPuestoId(Integer puestoId);
}