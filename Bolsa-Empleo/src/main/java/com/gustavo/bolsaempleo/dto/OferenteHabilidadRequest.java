package com.gustavo.bolsaempleo.dto;

import lombok.Data;
import java.util.List;

@Data
public class OferenteHabilidadRequest {
    private List<HabilidadDTO> habilidades;

    @Data
    public static class HabilidadDTO {
        private Integer caracteristicaId;
        private Integer nivel;
    }
}