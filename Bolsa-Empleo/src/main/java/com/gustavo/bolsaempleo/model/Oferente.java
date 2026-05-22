package com.gustavo.bolsaempleo.model;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "oferente")
public class Oferente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(unique = true, nullable = false)
    private String identificacion;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "primer_apellido", nullable = false)
    private String primerApellido;

    private String nacionalidad;
    private String telefono;

    @Column(name = "lugar_residencia")
    private String lugarResidencia;

    @Column(name = "curriculum_pdf")
    private String curriculumPdf;

    private Boolean aprobado = false;
}