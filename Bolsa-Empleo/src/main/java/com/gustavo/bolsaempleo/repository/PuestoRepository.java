package com.gustavo.bolsaempleo.repository;

import com.gustavo.bolsaempleo.model.Puesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PuestoRepository extends JpaRepository<Puesto, Integer> {

    List<Puesto> findTop5ByTipoAndActivoTrueOrderByFechaRegistroDesc(Puesto.TipoPuesto tipo);

    // TODOS los puestos de la empresa (activos e inactivos) para el panel
    List<Puesto> findByEmpresaId(Integer empresaId);

    // Solo los activos (para búsqueda pública)
    List<Puesto> findByEmpresaIdAndActivoTrue(Integer empresaId);

    @Query("""
        SELECT DISTINCT p FROM Puesto p
        JOIN p.caracteristicas pc
        WHERE p.tipo = :tipo
        AND p.activo = true
        AND pc.caracteristica.id IN :caracteristicaIds
    """)
    List<Puesto> buscarPorCaracteristicas(
            @Param("caracteristicaIds") List<Integer> caracteristicaIds,
            @Param("tipo") Puesto.TipoPuesto tipo
    );
}