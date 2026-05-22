package com.gustavo.bolsaempleo.model;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "puesto_caracteristica")
public class PuestoCaracteristica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "puesto_id", nullable = false)
    private Puesto puesto;

    @ManyToOne
    @JoinColumn(name = "caracteristica_id", nullable = false)
    private Caracteristica caracteristica;

    @Column(name = "nivel_requerido", nullable = false)
    private Integer nivelRequerido;
}