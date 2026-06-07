import { useState, useEffect, useRef } from "react";
import { buscarPuestosPublicos, getCaracteristicasPublicas } from "../../api/api";

const NIVELES = ["", "Básico", "Intermedio", "Avanzado", "Experto", "Máster"];

// Recoge todos los ids de un nodo y sus descendientes
function recogerIds(nodo) {
    const ids = [nodo.id];
    if (nodo.hijos) nodo.hijos.forEach((h) => ids.push(...recogerIds(h)));
    return ids;
}

// Verifica si todos los hijos de un nodo están seleccionados
function todosHijosSeleccionados(nodo, seleccionados) {
    if (!nodo.hijos || nodo.hijos.length === 0) return seleccionados.includes(nodo.id);
    return nodo.hijos.every((h) => todosHijosSeleccionados(h, seleccionados));
}

// Verifica si algún hijo está seleccionado (indeterminado)
function algunHijoSeleccionado(nodo, seleccionados) {
    if (!nodo.hijos || nodo.hijos.length === 0) return seleccionados.includes(nodo.id);
    return nodo.hijos.some((h) => algunHijoSeleccionado(h, seleccionados));
}

function NodoCaracteristica({ nodo, seleccionados, onToggle, onToggleGrupo, nivel = 0 }) {
    const [expandido, setExpandido] = useState(true);
    const tieneHijos = nodo.hijos && nodo.hijos.length > 0;
    const esPadre = nivel === 0;

    const todosMarcados = tieneHijos ? todosHijosSeleccionados(nodo, seleccionados) : seleccionados.includes(nodo.id);
    const algunoMarcado = tieneHijos ? algunHijoSeleccionado(nodo, seleccionados) : seleccionados.includes(nodo.id);
    const indeterminado = tieneHijos && algunoMarcado && !todosMarcados;
    const marcado = tieneHijos ? todosMarcados : seleccionados.includes(nodo.id);

    const checkRef = useRef(null);
    useEffect(() => {
        if (checkRef.current) checkRef.current.indeterminate = indeterminado;
    }, [indeterminado]);

    const handleChange = () => {
        if (tieneHijos) {
            onToggleGrupo(nodo, !todosMarcados);
        } else {
            onToggle(nodo.id);
        }
    };

    return (
        <div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "16px 20px minmax(0,1fr)",
                alignItems: "center",
                gap: 6,
                padding: esPadre ? "7px 8px" : "5px 8px",
                borderRadius: "var(--border-radius-md)",
                background: marcado || indeterminado
                    ? "var(--color-background-info)"
                    : "transparent",
                transition: "background 0.12s",
                cursor: "pointer",
            }}
                 onClick={handleChange}
            >
                {/* Flecha expand/collapse — solo para nodos con hijos */}
                {tieneHijos ? (
                    <span
                        onClick={(e) => { e.stopPropagation(); setExpandido(!expandido); }}
                        style={{
                            fontSize: 9, color: "var(--color-text-secondary)",
                            cursor: "pointer", userSelect: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
            {expandido ? "▼" : "▶"}
          </span>
                ) : (
                    <span />
                )}

                {/* Checkbox */}
                <input
                    ref={checkRef}
                    type="checkbox"
                    checked={marcado}
                    onChange={handleChange}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        cursor: "pointer",
                        accentColor: "var(--color-border-info)",
                        margin: 0,
                        width: 14, height: 14,
                    }}
                />

                {/* Label */}
                <span style={{
                    fontSize: esPadre ? 13 : 13,
                    fontWeight: esPadre ? 500 : 400,
                    color: marcado || indeterminado
                        ? "var(--color-text-info)"
                        : "var(--color-text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                }}>
          {nodo.nombre}
        </span>
            </div>

            {/* Hijos */}
            {tieneHijos && expandido && (
                <div style={{
                    marginLeft: 20,
                    paddingLeft: 10,
                    borderLeft: "1.5px solid var(--color-border-tertiary)",
                    marginTop: 2,
                    marginBottom: 2,
                }}>
                    {nodo.hijos.map((hijo) => (
                        <NodoCaracteristica
                            key={hijo.id}
                            nodo={hijo}
                            seleccionados={seleccionados}
                            onToggle={onToggle}
                            onToggleGrupo={onToggleGrupo}
                            nivel={nivel + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function TarjetaPuesto({ puesto }) {
    const [hover, setHover] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setHover(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const salario = puesto.salario
        ? `₡ ${Number(puesto.salario).toLocaleString("es-CR")}`
        : "A convenir";

    return (
        <div
            ref={ref}
            style={{ position: "relative" }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={{
                background: "var(--color-background-primary)",
                border: `0.5px solid ${hover ? "var(--color-border-info)" : "var(--color-border-tertiary)"}`,
                borderRadius: "var(--border-radius-lg)",
                padding: "14px 16px",
                transition: "border-color 0.15s",
                cursor: "default",
            }}>
                <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {puesto.empresaNombre}
                </p>
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 6px", color: "var(--color-text-primary)", lineHeight: 1.35 }}>
                    {puesto.descripcion.length > 55 ? puesto.descripcion.slice(0, 55) + "…" : puesto.descripcion}
                </p>
                <p style={{ fontSize: 13, color: "var(--color-text-info)", fontWeight: 500, margin: 0 }}>
                    {salario}
                </p>
            </div>

            {/* Tooltip al hover */}
            {hover && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: "calc(100% + 8px)",
                    zIndex: 100,
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-secondary)",
                    borderRadius: "var(--border-radius-lg)",
                    padding: "14px 16px",
                    width: 240,
                    boxSizing: "border-box",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}>
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{puesto.empresaNombre}</p>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 4px", color: "var(--color-text-primary)" }}>{puesto.descripcion}</p>
                    <p style={{ fontSize: 13, color: "var(--color-text-info)", fontWeight: 500, margin: "0 0 10px" }}>{salario}</p>

                    {puesto.caracteristicas && puesto.caracteristicas.length > 0 && (
                        <>
                            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" }}>
                                Requisitos
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {puesto.caracteristicas.map((c, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 12, color: "var(--color-text-primary)" }}>{c.caracteristicaNombre}</span>
                                        <span style={{
                                            fontSize: 11, fontWeight: 500,
                                            background: "var(--color-background-info)",
                                            color: "var(--color-text-info)",
                                            padding: "1px 7px", borderRadius: 999, whiteSpace: "nowrap",
                                        }}>
                      {NIVELES[c.nivelRequerido] || `Nivel ${c.nivelRequerido}`}
                    </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Buscar() {
    const [caracteristicas, setCaracteristicas] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [resultados, setResultados] = useState([]);
    const [buscado, setBuscado] = useState(false);
    const [cargandoFiltros, setCargandoFiltros] = useState(true);
    const [cargandoResultados, setCargandoResultados] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        getCaracteristicasPublicas()
            .then((r) => r.json())
            .then(setCaracteristicas)
            .catch(() => setError("No se pudieron cargar los filtros."))
            .finally(() => setCargandoFiltros(false));
    }, []);

    // Marcar/desmarcar un nodo hoja individual
    const toggleSeleccion = (id) => {
        setSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Marcar/desmarcar un grupo completo (padre + todos sus descendientes)
    const toggleGrupo = (nodo, marcar) => {
        const ids = recogerIds(nodo);
        setSeleccionados((prev) => {
            if (marcar) {
                const set = new Set([...prev, ...ids]);
                return Array.from(set);
            } else {
                return prev.filter((x) => !ids.includes(x));
            }
        });
    };

    const buscar = () => {
        if (seleccionados.length === 0) return;
        setCargandoResultados(true);
        setBuscado(true);
        setError(null);

        buscarPuestosPublicos(seleccionados)
            .then((r) => r.json())
            .then(setResultados)
            .catch(() => setError("No se pudo realizar la búsqueda."))
            .finally(() => setCargandoResultados(false));
    };

    const limpiar = () => {
        setSeleccionados([]);
        setResultados([]);
        setBuscado(false);
        setError(null);
    };

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem", minHeight: "80vh" }}>
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 1.5rem", color: "var(--color-text-primary)" }}>
                Buscar puestos
            </h1>

            <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr)", gap: "1.5rem", alignItems: "start" }}>

                {/* ── Panel filtros ── */}
                <div style={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-lg)",
                    padding: "1.25rem",
                    position: "sticky",
                    top: 70,
                }}>
                    <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
                        Filtrar por características
                    </p>

                    {seleccionados.length > 0 && (
                        <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            marginBottom: 10, padding: "5px 8px",
                            background: "var(--color-background-info)",
                            borderRadius: "var(--border-radius-md)",
                        }}>
              <span style={{ fontSize: 12, color: "var(--color-text-info)", fontWeight: 500 }}>
                {seleccionados.length} seleccionado{seleccionados.length !== 1 ? "s" : ""}
              </span>
                            <button
                                onClick={limpiar}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    fontSize: 12, color: "var(--color-text-info)", padding: 0, fontWeight: 500,
                                }}
                            >
                                Limpiar
                            </button>
                        </div>
                    )}

                    {cargandoFiltros ? (
                        <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Cargando...</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                            {caracteristicas.map((nodo) => (
                                <NodoCaracteristica
                                    key={nodo.id}
                                    nodo={nodo}
                                    seleccionados={seleccionados}
                                    onToggle={toggleSeleccion}
                                    onToggleGrupo={toggleGrupo}
                                    nivel={0}
                                />
                            ))}
                        </div>
                    )}

                    <button
                        onClick={buscar}
                        disabled={seleccionados.length === 0 || cargandoResultados}
                        style={{
                            width: "100%", padding: "8px 0", fontSize: 13, fontWeight: 500,
                            background: seleccionados.length === 0 ? "var(--color-background-secondary)" : "var(--color-primary)",
                            color: seleccionados.length === 0 ? "var(--color-text-secondary)" : "#fff",
                            border: "none", borderRadius: "var(--border-radius-md)",
                            cursor: seleccionados.length === 0 ? "not-allowed" : "pointer",
                            transition: "background 0.15s",
                        }}
                    >
                        {cargandoResultados ? "Buscando..." : "Buscar"}
                    </button>
                </div>

                {/* ── Panel resultados ── */}
                <div>
                    {!buscado ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, color: "var(--color-text-secondary)", gap: 8 }}>
                            <span style={{ fontSize: 32 }}>🔍</span>
                            <p style={{ margin: 0, fontSize: 14 }}>Seleccioná características y presioná Buscar</p>
                        </div>
                    ) : cargandoResultados ? (
                        <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Buscando puestos...</p>
                    ) : error ? (
                        <p className="msg-error">{error}</p>
                    ) : resultados.length === 0 ? (
                        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)", fontSize: 14 }}>
                            No se encontraron puestos con esas características.
                        </div>
                    ) : (
                        <>
                            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 1rem" }}>
                                {resultados.length} resultado{resultados.length !== 1 ? "s" : ""}
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                                {resultados.map((p) => (
                                    <TarjetaPuesto key={p.id} puesto={p} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}