package com.gustavo.bolsaempleo.controller;

import com.gustavo.bolsaempleo.dto.OferenteHabilidadRequest;
import com.gustavo.bolsaempleo.dto.OferenteRequest;
import com.gustavo.bolsaempleo.model.Oferente;
import com.gustavo.bolsaempleo.service.OferenteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OferenteController {

    private final OferenteService oferenteService;

    // Registro público de oferente
    @PostMapping("/api/public/oferente/registro")
    public ResponseEntity<Oferente> registrar(@RequestBody OferenteRequest request) {
        return ResponseEntity.ok(oferenteService.registrar(request));
    }

    // Dashboard del oferente logueado
    @GetMapping("/api/oferente/dashboard")
    public ResponseEntity<Oferente> dashboard(Authentication auth) {
        return ResponseEntity.ok(oferenteService.getByUsuarioCorreo(auth.getName()));
    }

    // Actualizar habilidades
    @PutMapping("/api/oferente/habilidades")
    public ResponseEntity<?> actualizarHabilidades(
            @RequestBody OferenteHabilidadRequest request,
            Authentication auth) {
        oferenteService.actualizarHabilidades(auth.getName(), request);
        return ResponseEntity.ok("Habilidades actualizadas");
    }
}