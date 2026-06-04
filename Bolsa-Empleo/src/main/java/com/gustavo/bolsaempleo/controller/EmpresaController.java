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

    // ── REGISTRO PÚBLICO ────────────────────────────────────────────────────────

    @PostMapping("/api/public/empresa/registro")
    public ResponseEntity<Empresa> registrar(@RequestBody EmpresaRequest request) {
        return ResponseEntity.ok(empresaService.registrar(request));
    }

    // ── DASHBOARD ───────────────────────────────────────────────────────────────

    @GetMapping("/api/empresa/dashboard")
    public ResponseEntity<Empresa> dashboard(Authentication auth) {
        return ResponseEntity.ok(empresaService.getByUsuarioCorreo(auth.getName()));
    }

    // ── PUESTOS ─────────────────────────────────────────────────────────────────

    // Publicar un nuevo puesto
    @PostMapping("/api/empresa/puestos")
    public ResponseEntity<?> publicarPuesto(
            @RequestBody PuestoRequest request,
            Authentication auth) {
        return ResponseEntity.ok(puestoService.publicar(auth.getName(), request));
    }

    // Ver mis puestos activos
    @GetMapping("/api/empresa/puestos")
    public ResponseEntity<List<PuestoResponse>> getMisPuestos(Authentication auth) {
        return ResponseEntity.ok(puestoService.getMisPuestos(auth.getName()));
    }

    // Desactivar un puesto (cuando ya se cubrió la vacante)
    @PutMapping("/api/empresa/puestos/{id}/desactivar")
    public ResponseEntity<?> desactivar(
            @PathVariable Integer id,
            Authentication auth) {
        puestoService.desactivar(id, auth.getName());
        return ResponseEntity.ok("Puesto desactivado");
    }

    // ── CANDIDATOS ──────────────────────────────────────────────────────────────

    /**
     * Buscar candidatos cuyas habilidades coincidan con las características
     * requeridas por un puesto específico (con el nivel mínimo indicado).
     * Requerimiento del proyecto: empresa busca oferentes por puesto.
     */
    @GetMapping("/api/empresa/puestos/{id}/candidatos")
    public ResponseEntity<List<CandidatoResponse>> buscarCandidatos(
            @PathVariable Integer id,
            Authentication auth) {
        return ResponseEntity.ok(oferenteService.buscarCandidatosPorPuesto(id));
    }

    /**
     * Ver el detalle completo de un candidato (oferente) individual,
     * incluyendo sus habilidades. El CV se manejará en una fase posterior.
     */
    @GetMapping("/api/empresa/candidatos/{oferenteId}")
    public ResponseEntity<CandidatoResponse> verDetalleCandidato(
            @PathVariable Integer oferenteId,
            Authentication auth) {
        return ResponseEntity.ok(oferenteService.getDetalleCandidato(oferenteId));
    }
}