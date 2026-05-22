package com.gustavo.bolsaempleo.model;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private String nombre;

    private String localizacion;
    private String telefono;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private Boolean aprobada = false;
}