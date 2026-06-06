package com.gustavo.bolsaempleo.controller;

import com.gustavo.bolsaempleo.dto.CaracteristicaDTO;
import com.gustavo.bolsaempleo.dto.PuestoResponse;
import com.gustavo.bolsaempleo.service.CaracteristicaService;
import com.gustavo.bolsaempleo.service.PuestoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PuestoService puestoService;
    private final CaracteristicaService caracteristicaService;

    // Los 5 puestos públicos más recientes
    @GetMapping("/puestos/recientes")
    public ResponseEntity<List<PuestoResponse>> getRecientes() {
        return ResponseEntity.ok(puestoService.getPublicosRecientes());
    }

    // Buscar puestos por características
    @GetMapping("/puestos/buscar")
    public ResponseEntity<List<PuestoResponse>> buscar(
            @RequestParam List<Integer> caracteristicaIds) {
        return ResponseEntity.ok(puestoService.buscar(caracteristicaIds));
    }

    // Árbol de características para el buscador
    @GetMapping("/caracteristicas")
    public ResponseEntity<List<CaracteristicaDTO>> getCaracteristicas() {
        return ResponseEntity.ok(caracteristicaService.getArbol());
    }

    @PostMapping("/caracteristicas")
    public ResponseEntity<?> crearCaracteristica(
            @RequestParam String nombre,
            @RequestParam(required = false) Integer padreId
    ) {
        return ResponseEntity.ok(
                caracteristicaService.crear(nombre, padreId)
        );
    }
}