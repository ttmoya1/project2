package com.gustavo.bolsaempleo.controller;

import com.gustavo.bolsaempleo.dto.CandidatoResponse;
import com.gustavo.bolsaempleo.dto.OferenteHabilidadRequest;
import com.gustavo.bolsaempleo.dto.OferenteRequest;
import com.gustavo.bolsaempleo.model.Oferente;
import com.gustavo.bolsaempleo.service.OferenteService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public ResponseEntity<CandidatoResponse> dashboard(Authentication auth) {
        Oferente oferente = oferenteService.getByUsuarioCorreo(auth.getName());
        CandidatoResponse response = oferenteService.getDetalleCandidato(oferente.getId());
        return ResponseEntity.ok(response);
    }

    // Actualizar habilidades
    @PutMapping("/api/oferente/habilidades")
    public ResponseEntity<?> actualizarHabilidades(
            @RequestBody OferenteHabilidadRequest request,
            Authentication auth) {
        oferenteService.actualizarHabilidades(auth.getName(), request);
        return ResponseEntity.ok("Habilidades actualizadas");
    }

    // Subir currículo PDF
    @PostMapping(value = "/api/oferente/curriculo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirCurriculo(
            @RequestParam("archivo") MultipartFile archivo,
            Authentication auth) {
        oferenteService.subirCurriculo(auth.getName(), archivo);
        return ResponseEntity.ok("Currículo subido correctamente");
    }

    // Descargar/ver currículo propio
    @GetMapping("/api/oferente/curriculo")
    public ResponseEntity<Resource> verCurriculo(Authentication auth) {
        Resource resource = oferenteService.getCurriculo(auth.getName());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"curriculo.pdf\"")
                .body(resource);
    }

    // Descargar currículo de un candidato (para empresa)
    @GetMapping("/api/empresa/candidatos/{id}/curriculo")
    public ResponseEntity<Resource> verCurriculoCandidato(@PathVariable Integer id) {
        Resource resource = oferenteService.getCurriculoPorId(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"curriculo.pdf\"")
                .body(resource);
    }
}