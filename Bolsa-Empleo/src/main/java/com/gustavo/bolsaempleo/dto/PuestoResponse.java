package com.gustavo.bolsaempleo.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PuestoResponse {
    private Integer id;
    private String empresaNombre;
    private String descripcion;
    private BigDecimal salario;
    private String tipo;
    private Boolean activo;
    private LocalDateTime fechaRegistro;
    private List<CaracteristicaNivelDTO> caracteristicas;

    @Data
    public static class CaracteristicaNivelDTO {
        private Integer caracteristicaId;
        private String caracteristicaNombre;
        private Integer nivelRequerido;
    }
}