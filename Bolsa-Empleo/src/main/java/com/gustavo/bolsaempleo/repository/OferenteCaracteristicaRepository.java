package com.gustavo.bolsaempleo.repository;


import com.gustavo.bolsaempleo.model.OferenteCaracteristica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface OferenteCaracteristicaRepository extends JpaRepository<OferenteCaracteristica, Integer> {

    List<OferenteCaracteristica> findByOferenteId(Integer oferenteId);

    // Buscar oferentes que tengan las habilidades requeridas con el nivel mínimo
    @Query("""
        SELECT DISTINCT oc.oferente FROM OferenteCaracteristica oc
        WHERE oc.caracteristica.id = :caracteristicaId
        AND oc.nivel >= :nivelMinimo
    """)
    List<com.gustavo.bolsaempleo.model.Oferente> buscarOferentesPorHabilidad(
            Integer caracteristicaId,
            Integer nivelMinimo
    );
}