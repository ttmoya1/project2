package com.gustavo.bolsaempleo.dto;

import lombok.Data;
import java.util.List;

@Data
public class CandidatoResponse {
    private Integer id;
    private String nombre;
    private String primerApellido;
    private String identificacion;
    private String nacionalidad;
    private String telefono;
    private String lugarResidencia;
    private String correo;
    private boolean tieneCurriculo;
    private List<HabilidadDTO> habilidades;

    @Data
    public static class HabilidadDTO {
        private Integer caracteristicaId;
        private String caracteristicaNombre;
        private Integer nivel;
    }
}