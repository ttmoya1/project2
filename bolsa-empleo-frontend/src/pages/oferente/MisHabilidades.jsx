import { useEffect, useState } from "react";
import { getCaracteristicasPublicas, getDashboardOferente, actualizarHabilidades } from "../../api/api";
import { NIVELES, nivelLabel } from "../../utils/nivelUtils";

export default function MisHabilidades() {
    const [arbol, setArbol] = useState([]);
    const [seleccionadas, setSeleccionadas] = useState({});
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [msg, setMsg] = useState({ tipo: "", texto: "" });

    useEffect(() => {
        Promise.all([
            getCaracteristicasPublicas().then(r => r.json()),
            getDashboardOferente().then(r => r.json()),
        ])
            .then(([caracteristicas, oferente]) => {
                setArbol(caracteristicas);
                if (oferente.habilidades?.length > 0) {
                    const previas = {};
                    oferente.habilidades.forEach(c => {
                        const id = c.caracteristicaId ?? c.caracteristica?.id;
                        const nivel = c.nivel ?? c.nivelRequerido;
                        if (id) previas[id] = nivel;
                    });
                    setSeleccionadas(previas);
                }
            })
            .catch(() => setMsg({ tipo: "error", texto: "Error al cargar datos." }))
            .finally(() => setCargando(false));
    }, []);

    const toggleCaracteristica = (id) => {
        setSeleccionadas(prev => {
            const nuevo = { ...prev };
            if (nuevo[id] !== undefined) delete nuevo[id];
            else nuevo[id] = 1;
            return nuevo;
        });
    };

    const cambiarNivel = (id, nivel) => {
        setSeleccionadas(prev => ({ ...prev, [id]: Number(nivel) }));
    };

    const handleGuardar = async () => {
        setGuardando(true);
        setMsg({ tipo: "", texto: "" });
        try {
            const habilidades = Object.entries(seleccionadas).map(([id, nivel]) => ({
                caracteristicaId: Number(id),
                nivel: Number(nivel),
            }));
            const res = await actualizarHabilidades(habilidades);
            if (!res.ok) throw new Error();
            setMsg({ tipo: "success", texto: "¡Habilidades actualizadas correctamente!" });
        } catch {
            setMsg({ tipo: "error", texto: "Error al guardar. Intente de nuevo." });
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) return <div className="page"><p className="msg-empty">Cargando...</p></div>;

    const totalSeleccionadas = Object.keys(seleccionadas).length;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Mis Habilidades</h1>
                    <p style={{ marginTop: "2px" }}>
                        Seleccioná tus destrezas e indicá el nivel que tenés en cada una.
                    </p>
                </div>
                <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    style={{
                        background: "var(--color-primary)",
                        borderColor: "var(--color-primary)",
                        color: "#fff",
                        fontWeight: "500",
                        padding: "8px 20px",
                    }}
                >
                    {guardando ? "Guardando..." : `Guardar (${totalSeleccionadas})`}
                </button>
            </div>

            {msg.texto && (
                <p className={msg.tipo === "error" ? "msg-error" : "msg-success"} style={{ marginBottom: "1rem" }}>
                    {msg.texto}
                </p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {arbol.map(raiz => (
                    <NodoArbol
                        key={raiz.id}
                        nodo={raiz}
                        seleccionadas={seleccionadas}
                        onToggle={toggleCaracteristica}
                        onNivel={cambiarNivel}
                        profundidad={0}
                        esRaiz
                    />
                ))}
            </div>
        </div>
    );
}

// ── Componente recursivo principal ───────────────────────────────────────────
function NodoArbol({ nodo, seleccionadas, onToggle, onNivel, profundidad, esRaiz = false }) {
    const [expandido, setExpandido] = useState(true);
    const tieneHijos = nodo.hijos && nodo.hijos.length > 0;

    // Los nodos raíz se renderizan como cards; los demás van inline
    if (esRaiz) {
        return (
            <div className="card" style={{ padding: "1rem" }}>
                {/* Cabecera del grupo raíz */}
                <button
                    onClick={() => setExpandido(e => !e)}
                    style={{
                        width: "100%", background: "transparent", border: "none",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: 0, cursor: "pointer",
                        marginBottom: expandido ? "12px" : 0,
                    }}
                >
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-primary)" }}>
                        {nodo.nombre}
                    </span>
                    <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="var(--color-text-secondary)" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: expandido ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {expandido && (
                    tieneHijos ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {nodo.hijos.map(hijo => (
                                <NodoArbol
                                    key={hijo.id}
                                    nodo={hijo}
                                    seleccionadas={seleccionadas}
                                    onToggle={onToggle}
                                    onNivel={onNivel}
                                    profundidad={1}
                                />
                            ))}
                        </div>
                    ) : (
                        // La raíz es a la vez hoja
                        <FilaHoja
                            nodo={nodo}
                            seleccionadas={seleccionadas}
                            onToggle={onToggle}
                            onNivel={onNivel}
                            profundidad={0}
                        />
                    )
                )}
            </div>
        );
    }

    // Nodo intermedio (tiene hijos pero no es raíz): subgrupo con sangría
    if (tieneHijos) {
        return (
            <div style={{ marginLeft: `${(profundidad - 1) * 14}px` }}>
                {/* Etiqueta del subgrupo */}
                <button
                    onClick={() => setExpandido(e => !e)}
                    style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: "none", border: "none", cursor: "pointer",
                        padding: "5px 6px", width: "100%",
                        borderRadius: "var(--border-radius-sm)",
                    }}
                >
                    <span style={{
                        fontSize: 10, color: "var(--color-text-secondary)",
                        lineHeight: 1, flexShrink: 0,
                    }}>
                        {expandido ? "▼" : "▶"}
                    </span>
                    <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                        {nodo.nombre}
                    </span>
                </button>

                {expandido && (
                    <div style={{
                        borderLeft: "1.5px solid var(--color-border-tertiary)",
                        marginLeft: 10, paddingLeft: 8,
                        display: "flex", flexDirection: "column", gap: "2px",
                        marginBottom: 4,
                    }}>
                        {nodo.hijos.map(hijo => (
                            <NodoArbol
                                key={hijo.id}
                                nodo={hijo}
                                seleccionadas={seleccionadas}
                                onToggle={onToggle}
                                onNivel={onNivel}
                                profundidad={profundidad + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Nodo hoja: checkbox + nivel
    return (
        <FilaHoja
            nodo={nodo}
            seleccionadas={seleccionadas}
            onToggle={onToggle}
            onNivel={onNivel}
            profundidad={profundidad}
        />
    );
}

// ── Fila hoja (checkbox + selector de nivel) ─────────────────────────────────
function FilaHoja({ nodo, seleccionadas, onToggle, onNivel, profundidad }) {
    const marcado = seleccionadas[nodo.id] !== undefined;
    const nivel = seleccionadas[nodo.id] ?? 1;

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "5px 8px",
            paddingLeft: `${8 + (profundidad > 0 ? (profundidad - 1) * 14 : 0)}px`,
            borderRadius: "var(--border-radius-sm)",
            background: marcado ? "var(--color-background-info)" : "transparent",
            transition: "background 0.15s",
        }}>
            <input
                type="checkbox"
                checked={marcado}
                onChange={() => onToggle(nodo.id)}
                style={{ width: "15px", height: "15px", cursor: "pointer", flexShrink: 0, accentColor: "var(--color-border-info)" }}
            />
            <span style={{
                flex: 1, fontSize: "13px",
                color: marcado ? "var(--color-text-info)" : "var(--color-text-primary)",
                fontWeight: marcado ? "500" : "400",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
                {nodo.nombre}
            </span>

            {marcado && (
                <select
                    value={nivel}
                    onChange={e => onNivel(nodo.id, e.target.value)}
                    style={{
                        width: "110px", padding: "3px 6px", fontSize: "12px",
                        borderColor: "var(--color-border-info)", flexShrink: 0,
                    }}
                >
                    {NIVELES.map(n => (
                        <option key={n.valor} value={n.valor}>{n.label}</option>
                    ))}
                </select>
            )}
        </div>
    );
}