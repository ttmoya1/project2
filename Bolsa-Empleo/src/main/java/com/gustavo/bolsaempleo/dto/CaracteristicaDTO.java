package com.gustavo.bolsaempleo.dto;

import lombok.Data;
import java.util.List;

@Data
public class CaracteristicaDTO {
    private Integer id;
    private String nombre;
    private List<CaracteristicaDTO> hijos;
}