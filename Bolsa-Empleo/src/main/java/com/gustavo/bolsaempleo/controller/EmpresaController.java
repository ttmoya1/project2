package com.gustavo.bolsaempleo.controller;

import com.gustavo.bolsaempleo.dto.CandidatoResponse;
import com.gustavo.bolsaempleo.dto.EmpresaRequest;
import com.gustavo.bolsaempleo.dto.PuestoRequest;
import com.gustavo.bolsaempleo.dto.PuestoResponse;
import com.gustavo.bolsaempleo.model.Empresa;
import com.gustavo.bolsaempleo.service.EmpresaService;
import com.gustavo.bolsaempleo.service.OferenteService;
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
    private final OferenteService oferenteService;

    @PostMapping("/api/public/empresa/registro")
    public ResponseEntity<Empresa> registrar(@RequestBody EmpresaRequest request) {
        return ResponseEntity.ok(empresaService.registrar(request));
    }

    @GetMapping("/api/empresa/dashboard")
    public ResponseEntity<Empresa> dashboard(Authentication auth) {
        return ResponseEntity.ok(empresaService.getByUsuarioCorreo(auth.getName()));
    }

    @PostMapping("/api/empresa/puestos")
    public ResponseEntity<?> publicarPuesto(@RequestBody PuestoRequest request, Authentication auth) {
        return ResponseEntity.ok(puestoService.publicar(auth.getName(), request));
    }

    @GetMapping("/api/empresa/puestos")
    public ResponseEntity<List<PuestoResponse>> getMisPuestos(Authentication auth) {
        return ResponseEntity.ok(puestoService.getMisPuestos(auth.getName()));
    }

    // Hacer el puesto PRIVADO (visible solo para oferentes registrados)
    @PutMapping("/api/empresa/puestos/{id}/privado")
    public ResponseEntity<?> hacerPrivado(@PathVariable Integer id, Authentication auth) {
        puestoService.hacerPrivado(id, auth.getName());
        return ResponseEntity.ok("Puesto cambiado a privado");
    }

    // Hacer el puesto PÚBLICO (visible para todos)
    @PutMapping("/api/empresa/puestos/{id}/publico")
    public ResponseEntity<?> hacerPublico(@PathVariable Integer id, Authentication auth) {
        puestoService.hacerPublico(id, auth.getName());
        return ResponseEntity.ok("Puesto cambiado a público");
    }

    // Desactivar completamente (ya se cubrió la vacante)
    @PutMapping("/api/empresa/puestos/{id}/desactivar")
    public ResponseEntity<?> desactivar(@PathVariable Integer id, Authentication auth) {
        puestoService.desactivar(id, auth.getName());
        return ResponseEntity.ok("Puesto desactivado");
    }

    @GetMapping("/api/empresa/puestos/{id}/candidatos")
    public ResponseEntity<List<CandidatoResponse>> buscarCandidatos(
            @PathVariable Integer id, Authentication auth) {
        return ResponseEntity.ok(oferenteService.buscarCandidatosPorPuesto(id));
    }

    @GetMapping("/api/empresa/candidatos/{oferenteId}")
    public ResponseEntity<CandidatoResponse> verDetalleCandidato(
            @PathVariable Integer oferenteId, Authentication auth) {
        return ResponseEntity.ok(oferenteService.getDetalleCandidato(oferenteId));
    }
}