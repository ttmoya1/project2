package com.gustavo.bolsaempleo.model;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "puesto")
public class Puesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    private BigDecimal salario;

    @Enumerated(EnumType.STRING)
    private TipoPuesto tipo = TipoPuesto.PUBLICO;

    private Boolean activo = true;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @OneToMany(mappedBy = "puesto", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<PuestoCaracteristica> caracteristicas;

    public enum TipoPuesto {
        PUBLICO, PRIVADO
    }
}
