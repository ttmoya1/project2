package com.gustavo.bolsaempleo.controller;

import com.gustavo.bolsaempleo.dto.EmpresaRequest;
import com.gustavo.bolsaempleo.dto.PuestoRequest;
import com.gustavo.bolsaempleo.dto.PuestoResponse;
import com.gustavo.bolsaempleo.model.Empresa;
import com.gustavo.bolsaempleo.service.EmpresaService;
import com.gustavo.bolsaempleo.service.PuestoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaService empresaService;
    private final PuestoService puestoService;

    // Registro público de empresa
    @PostMapping("/api/public/empresa/registro")
    public ResponseEntity<Empresa> registrar(@RequestBody EmpresaRequest request) {
        return ResponseEntity.ok(empresaService.registrar(request));
    }

    // Dashboard de la empresa logueada
    @GetMapping("/api/empresa/dashboard")
    public ResponseEntity<Empresa> dashboard(Authentication auth) {
        return ResponseEntity.ok(empresaService.getByUsuarioCorreo(auth.getName()));
    }

    // Publicar un puesto
    @PostMapping("/api/empresa/puestos")
    public ResponseEntity<?> publicarPuesto(
            @RequestBody PuestoRequest request,
            Authentication auth) {
        return ResponseEntity.ok(puestoService.publicar(auth.getName(), request));
    }

    // Ver mis puestos
    @GetMapping("/api/empresa/puestos")
    public ResponseEntity<List<PuestoResponse>> getMisPuestos(Authentication auth) {
        return ResponseEntity.ok(puestoService.getMisPuestos(auth.getName()));
    }

    // Desactivar un puesto
    @PutMapping("/api/empresa/puestos/{id}/desactivar")
    public ResponseEntity<?> desactivar(
            @PathVariable Integer id,
            Authentication auth) {
        puestoService.desactivar(id, auth.getName());
        return ResponseEntity.ok("Puesto desactivado");
    }
}