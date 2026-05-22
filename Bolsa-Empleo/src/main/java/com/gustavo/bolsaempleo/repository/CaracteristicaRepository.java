package com.gustavo.bolsaempleo.repository;
import com.gustavo.bolsaempleo.model.Caracteristica;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CaracteristicaRepository extends JpaRepository<Caracteristica, Integer> {
    // Trae solo las categorías raíz (sin padre)
    List<Caracteristica> findByPadreIsNull();
    // Trae los hijos de una categoría
    List<Caracteristica> findByPadreId(Integer padreId);
}