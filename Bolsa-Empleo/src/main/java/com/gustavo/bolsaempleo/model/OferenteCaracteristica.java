package com.gustavo.bolsaempleo.model;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "oferente_caracteristica")
public class OferenteCaracteristica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "oferente_id", nullable = false)
    private Oferente oferente;

    @ManyToOne
    @JoinColumn(name = "caracteristica_id", nullable = false)
    private Caracteristica caracteristica;

    @Column(nullable = false)
    private Integer nivel;
}