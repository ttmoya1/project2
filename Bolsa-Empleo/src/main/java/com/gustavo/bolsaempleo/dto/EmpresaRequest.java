package com.gustavo.bolsaempleo.dto;

import lombok.Data;

@Data
public class EmpresaRequest {
    private String nombre;
    private String localizacion;
    private String correo;
    private String clave;
    private String telefono;
    private String descripcion;
}