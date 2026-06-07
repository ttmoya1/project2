package com.gustavo.bolsaempleo.repository;

import com.gustavo.bolsaempleo.model.PuestoCaracteristica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PuestoCaracteristicaRepository extends JpaRepository<PuestoCaracteristica, Integer> {
    List<PuestoCaracteristica> findByPuestoId(Integer puestoId);

    @Modifying
    @Query("DELETE FROM PuestoCaracteristica pc WHERE pc.puesto.id = :puestoId")
    void deleteByPuestoId(@Param("puestoId") Integer puestoId);
}