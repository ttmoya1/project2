package com.gustavo.bolsaempleo.dto;

import lombok.Data;

@Data
public class OferenteRequest {
    private String identificacion;
    private String nombre;
    private String primerApellido;
    private String nacionalidad;
    private String telefono;
    private String correo;
    private String clave;
    private String lugarResidencia;
}