package com.gustavo.bolsaempleo.repository;

import com.gustavo.bolsaempleo.model.Puesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PuestoRepository extends JpaRepository<Puesto, Integer> {

    // Los 5 puestos públicos más recientes para la página principal
    List<Puesto> findTop5ByTipoAndActivoTrueOrderByFechaRegistroDesc(
            Puesto.TipoPuesto tipo
    );

    // Puestos activos de una empresa específica
    List<Puesto> findByEmpresaIdAndActivoTrue(Integer empresaId);

    // Buscar puestos públicos por características
    // FIX: usar parámetro tipado en vez de string literal para el enum
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