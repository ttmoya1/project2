package com.gustavo.bolsaempleo.repository;


import com.gustavo.bolsaempleo.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Integer> {
    List<Empresa> findByAprobadaFalse();
    Optional<Empresa> findByUsuarioId(Integer usuarioId);
}