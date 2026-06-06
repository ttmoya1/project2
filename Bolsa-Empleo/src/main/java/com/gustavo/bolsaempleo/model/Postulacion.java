package com.gustavo.bolsaempleo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "postulacion")  // FIX: el script SQL crea la tabla como "postulacion" sin 'es'
public class Postulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "oferente_id")
    private Oferente oferente;

    @ManyToOne
    @JoinColumn(name = "puesto_id")
    private Puesto puesto;

    private LocalDateTime fechaPostulacion;
}