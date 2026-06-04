package com.gustavo.bolsaempleo.repository;

import com.gustavo.bolsaempleo.model.Oferente;
import com.gustavo.bolsaempleo.model.OferenteCaracteristica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OferenteCaracteristicaRepository extends JpaRepository<OferenteCaracteristica, Integer> {

    List<OferenteCaracteristica> findByOferenteId(Integer oferenteId);

    // Buscar todos los oferentes que tengan AL MENOS una de las características
    // con el nivel mínimo requerido (usado para buscar candidatos por puesto)
    @Query("""
        SELECT DISTINCT oc.oferente FROM OferenteCaracteristica oc
        WHERE oc.caracteristica.id = :caracteristicaId
        AND oc.nivel >= :nivelMinimo
        AND oc.oferente.aprobado = true
    """)
    List<Oferente> buscarOferentesPorHabilidad(
            @Param("caracteristicaId") Integer caracteristicaId,
            @Param("nivelMinimo") Integer nivelMinimo
    );
}