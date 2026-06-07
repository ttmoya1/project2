package com.gustavo.bolsaempleo.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PuestoRequest {
    private String descripcion;
    private BigDecimal salario;
    private String tipo;
    private List<CaracteristicaNivelDTO> caracteristicas;

    @Data
    public static class CaracteristicaNivelDTO {
        private Integer caracteristicaId;
        private Integer nivelRequerido;
    }
}