package com.gustavo.bolsaempleo.repository;


import com.gustavo.bolsaempleo.model.Oferente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OferenteRepository extends JpaRepository<Oferente, Integer> {
    List<Oferente> findByAprobadoFalse();
    Optional<Oferente> findByUsuarioId(Integer usuarioId);
    Boolean existsByIdentificacion(String identificacion);
}
