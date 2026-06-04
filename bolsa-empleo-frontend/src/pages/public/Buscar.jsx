import { useState, useEffect, useRef } from "react";
import { buscarPuestosPublicos, getCaracteristicasPublicas } from "../../api/api";

// ── Nodo del árbol de características ────────────────────────────────────────
function NodoCaracteristica({ nodo, seleccionados, onToggle }) {
    const [abierto, setAbierto] = useState(true);
    const tieneHijos = nodo.hijos && nodo.hijos.length > 0;

    return (
        <li style={{ listStyle: "none", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {tieneHijos ? (
                    <button
                        onClick={() => setAbierto(!abierto)}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "0",
                            color: "var(--color-text-secondary)",
                            fontSize: "12px",
                            lineHeight: 1,
                            width: "16px",
                        }}
                        aria-label={abierto ? "Colapsar" : "Expandir"}
                    >
                        {abierto ? "▼" : "▶"}
                    </button>
                ) : (
                    <span style={{ width: "16px" }} />
                )}

                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "var(--color-text-primary)",
                        userSelect: "none",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={seleccionados.includes(nodo.id)}
                        onChange={() => onToggle(nodo.id)}
                        style={{ cursor: "pointer", accentColor: "var(--color-border-info)" }}
                    />
                    {nodo.nombre}
                </label>
            </div>

            {tieneHijos && abierto && (
                <ul style={{ paddingLeft: "24px", marginTop: "4px" }}>
                    {nodo.hijos.map((hijo) => (
                        <NodoCaracteristica
                            key={hijo.id}
                            nodo={hijo}
                            seleccionados={seleccionados}
                            onToggle={onToggle}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

// ── Tooltip con detalle del puesto ───────────────────────────────────────────
function TarjetaPuesto({ puesto }) {
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const ref = useRef(null);

    // Cierra tooltip al hacer clic fuera
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setMostrarDetalle(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const salarioFormato = puesto.salario
        ? `₡ ${Number(puesto.salario).toLocaleString("es-CR")}`
        : "No especificado";

    return (
        <div
            ref={ref}
            style={{ position: "relative" }}
            onMouseEnter={() => setMostrarDetalle(true)}
            onMouseLeave={() => setMostrarDetalle(false)}
        >
            {/* Tarjeta principal */}
            <div
                style={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-lg)",
                    padding: "1rem 1.25rem",
                    cursor: "default",
                    transition: "border-color 0.15s",
                    borderColor: mostrarDetalle
                        ? "var(--color-border-info)"
                        : "var(--color-border-tertiary)",
                }}
            >
                <p
                    style={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                        margin: "0 0 4px",
                    }}
                >
                    {puesto.empresaNombre}
                </p>
                <p
                    style={{
                        fontSize: "15px",
                        fontWeight: "500",
                        margin: "0 0 6px",
                        color: "var(--color-text-primary)",
                    }}
                >
                    {puesto.descripcion.length > 60
                        ? puesto.descripcion.slice(0, 60) + "…"
                        : puesto.descripcion}
                </p>
                <p
                    style={{
                        fontSize: "14px",
                        color: "var(--color-text-info)",
                        margin: "0",
                        fontWeight: "500",
                    }}
                >
                    {salarioFormato}
                </p>
            </div>

            {/* Tooltip / detalle al hover */}
            {mostrarDetalle && (
                <div
                    style={{
                        position: "absolute",
                        top: "0",
                        left: "calc(100% + 8px)",
                        zIndex: 100,
                        background: "var(--color-background-primary)",
                        border: "0.5px solid var(--color-border-secondary)",
                        borderRadius: "var(--border-radius-lg)",
                        padding: "1rem 1.25rem",
                        width: "260px",
                        boxSizing: "border-box",
                    }}
                >
                    <p
                        style={{
                            fontSize: "13px",
                            fontWeight: "500",
                            color: "var(--color-text-primary)",
                            margin: "0 0 8px",
                        }}
                    >
                        {puesto.empresaNombre}
                    </p>
                    <p
                        style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "var(--color-text-primary)",
                            margin: "0 0 4px",
                        }}
                    >
                        {puesto.descripcion.length > 80
                            ? puesto.descripcion.slice(0, 80) + "…"
                            : puesto.descripcion}
                    </p>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "var(--color-text-info)",
                            fontWeight: "500",
                            margin: "0 0 12px",
                        }}
                    >
                        {salarioFormato}
                    </p>

                    {puesto.caracteristicas && puesto.caracteristicas.length > 0 && (
                        <>
                            <p
                                style={{
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    color: "var(--color-text-secondary)",
                                    margin: "0 0 6px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                Requisitos
                            </p>
                            <ul style={{ padding: "0", margin: "0", listStyle: "none" }}>
                                {puesto.caracteristicas.map((c, i) => (
                                    <li
                                        key={i}
                                        style={{
                                            fontSize: "13px",
                                            color: "var(--color-text-primary)",
                                            padding: "2px 0",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "6px",
                                        }}
                                    >
                                        <span style={{ color: "var(--color-text-secondary)" }}>•</span>
                                        <span>
                                            {c.caracteristicaNombre}
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    color: "var(--color-text-secondary)",
                                                    marginLeft: "4px",
                                                }}
                                            >
                                                (nivel {c.nivelRequerido})
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Página principal de búsqueda ──────────────────────────────────────────────
export default function Buscar() {
    const [caracteristicas, setCaracteristicas] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [resultados, setResultados] = useState([]);
    const [buscado, setBuscado] = useState(false);
    const [cargandoFiltros, setCargandoFiltros] = useState(true);
    const [cargandoResultados, setCargandoResultados] = useState(false);
    const [error, setError] = useState(null);

    // Cargar árbol de características al montar
    useEffect(() => {
        getCaracteristicasPublicas()
            .then((res) => {
                if (!res.ok) throw new Error("Error al cargar características");
                return res.json();
            })
            .then(setCaracteristicas)
            .catch(() => setError("No se pudieron cargar los filtros."))
            .finally(() => setCargandoFiltros(false));
    }, []);

    const toggleSeleccion = (id) => {
        setSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const buscar = () => {
        if (seleccionados.length === 0) return;
        setCargandoResultados(true);
        setBuscado(true);
        setError(null);

        buscarPuestosPublicos(seleccionados)
            .then((res) => {
                if (!res.ok) throw new Error("Error en búsqueda");
                return res.json();
            })
            .then(setResultados)
            .catch(() => setError("No se pudo realizar la búsqueda."))
            .finally(() => setCargandoResultados(false));
    };

    return (
        <div
            style={{
                maxWidth: "1100px",
                margin: "0 auto",
                padding: "2rem 1.5rem",
                minHeight: "80vh",
            }}
        >
            <h1
                style={{
                    fontSize: "22px",
                    fontWeight: "500",
                    margin: "0 0 1.5rem",
                    color: "var(--color-text-primary)",
                }}
            >
                Buscar puestos
            </h1>

            <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                {/* ── Panel izquierdo: filtros ── */}
                <div
                    style={{
                        width: "280px",
                        flexShrink: 0,
                        background: "var(--color-background-primary)",
                        border: "0.5px solid var(--color-border-tertiary)",
                        borderRadius: "var(--border-radius-lg)",
                        padding: "1.25rem",
                    }}
                >
                    <p
                        style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "var(--color-text-secondary)",
                            margin: "0 0 1rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                        }}
                    >
                        Características
                    </p>

                    {cargandoFiltros ? (
                        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                            Cargando filtros…
                        </p>
                    ) : error && caracteristicas.length === 0 ? (
                        <p style={{ fontSize: "14px", color: "var(--color-text-danger)" }}>
                            {error}
                        </p>
                    ) : (
                        <ul style={{ padding: "0", margin: "0 0 1.25rem" }}>
                            {caracteristicas.map((nodo) => (
                                <NodoCaracteristica
                                    key={nodo.id}
                                    nodo={nodo}
                                    seleccionados={seleccionados}
                                    onToggle={toggleSeleccion}
                                />
                            ))}
                        </ul>
                    )}

                    <button
                        onClick={buscar}
                        disabled={seleccionados.length === 0 || cargandoResultados}
                        style={{
                            width: "100%",
                            padding: "8px 0",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor:
                                seleccionados.length === 0 ? "not-allowed" : "pointer",
                            opacity: seleccionados.length === 0 ? 0.5 : 1,
                        }}
                    >
                        {cargandoResultados ? "Buscando…" : "Buscar"}
                    </button>

                    {seleccionados.length > 0 && (
                        <button
                            onClick={() => {
                                setSeleccionados([]);
                                setResultados([]);
                                setBuscado(false);
                            }}
                            style={{
                                width: "100%",
                                padding: "6px 0",
                                fontSize: "13px",
                                marginTop: "8px",
                                color: "var(--color-text-secondary)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Limpiar selección
                        </button>
                    )}
                </div>

                {/* ── Panel derecho: resultados ── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {!buscado ? (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "200px",
                                color: "var(--color-text-secondary)",
                                fontSize: "14px",
                                gap: "8px",
                            }}
                        >
                            <span style={{ fontSize: "32px" }}>🔍</span>
                            <p style={{ margin: 0 }}>
                                Selecciona características y presiona Buscar
                            </p>
                        </div>
                    ) : cargandoResultados ? (
                        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                            Buscando puestos…
                        </p>
                    ) : error ? (
                        <p style={{ fontSize: "14px", color: "var(--color-text-danger)" }}>
                            {error}
                        </p>
                    ) : resultados.length === 0 ? (
                        <div
                            style={{
                                background: "var(--color-background-secondary)",
                                borderRadius: "var(--border-radius-lg)",
                                padding: "2rem",
                                textAlign: "center",
                                color: "var(--color-text-secondary)",
                                fontSize: "14px",
                            }}
                        >
                            No se encontraron puestos con esas características.
                        </div>
                    ) : (
                        <>
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "var(--color-text-secondary)",
                                    margin: "0 0 1rem",
                                }}
                            >
                                {resultados.length}{" "}
                                {resultados.length === 1 ? "resultado" : "resultados"}
                            </p>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fill, minmax(220px, 1fr))",
                                    gap: "1rem",
                                }}
                            >
                                {resultados.map((puesto) => (
                                    <TarjetaPuesto key={puesto.id} puesto={puesto} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}