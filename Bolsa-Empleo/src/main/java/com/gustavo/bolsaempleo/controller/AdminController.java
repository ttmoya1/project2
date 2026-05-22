package com.gustavo.bolsaempleo.controller;

import com.gustavo.bolsaempleo.dto.CaracteristicaDTO;
import com.gustavo.bolsaempleo.model.Empresa;
import com.gustavo.bolsaempleo.model.Oferente;
import com.gustavo.bolsaempleo.service.CaracteristicaService;
import com.gustavo.bolsaempleo.service.EmpresaService;
import com.gustavo.bolsaempleo.service.OferenteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final EmpresaService empresaService;
    private final OferenteService oferenteService;
    private final CaracteristicaService caracteristicaService;

    // Listar empresas pendientes
    @GetMapping("/empresas/pendientes")
    public ResponseEntity<List<Empresa>> getEmpresasPendientes() {
        return ResponseEntity.ok(empresaService.getPendientes());
    }

    // Aprobar empresa
    @PutMapping("/empresas/{id}/aprobar")
    public ResponseEntity<Empresa> aprobarEmpresa(@PathVariable Integer id) {
        return ResponseEntity.ok(empresaService.aprobar(id));
    }

    // Listar oferentes pendientes
    @GetMapping("/oferentes/pendientes")
    public ResponseEntity<List<Oferente>> getOferentesPendientes() {
        return ResponseEntity.ok(oferenteService.getPendientes());
    }

    // Aprobar oferente
    @PutMapping("/oferentes/{id}/aprobar")
    public ResponseEntity<Oferente> aprobarOferente(@PathVariable Integer id) {
        return ResponseEntity.ok(oferenteService.aprobar(id));
    }

    // Ver árbol de características
    @GetMapping("/caracteristicas")
    public ResponseEntity<List<CaracteristicaDTO>> getCaracteristicas() {
        return ResponseEntity.ok(caracteristicaService.getArbol());
    }

    // Crear nueva característica
    @PostMapping("/caracteristicas")
    public ResponseEntity<?> crearCaracteristica(@RequestBody Map<String, Object> body) {
        String nombre = (String) body.get("nombre");
        Integer padreId = body.get("padreId") != null ?
                (Integer) body.get("padreId") : null;
        return ResponseEntity.ok(caracteristicaService.crear(nombre, padreId));
    }
}