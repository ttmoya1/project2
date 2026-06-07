import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:8080";
const getToken = () => localStorage.getItem("token");


function aplanarArbol(nodos, nivel = 0) {
    const resultado = [];
    for (const nodo of nodos) {
        resultado.push({ ...nodo, nivel });
        if (nodo.hijos && nodo.hijos.length > 0) {
            resultado.push(...aplanarArbol(nodo.hijos, nivel + 1));
        }
    }
    return resultado;
}


function NodoArbol({ nodo, nivel = 0 }) {
    const [expandido, setExpandido] = useState(true);
    const tieneHijos = nodo.hijos && nodo.hijos.length > 0;

    return (
        <div>
            <div style={{
                display: "flex", alignItems: "center",
                padding: "10px 16px",
                paddingLeft: `${nivel * 28 + 16}px`,
                borderBottom: "0.5px solid var(--color-border-tertiary)",
                background: nivel === 0 ? "var(--color-background-secondary)" : "var(--color-background-primary)",
            }}>
                {tieneHijos ? (
                    <button
                        onClick={() => setExpandido(e => !e)}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            marginRight: "6px", fontSize: "11px", color: "var(--color-text-secondary)",
                            padding: "0 4px", lineHeight: 1,
                        }}
                    >
                        {expandido ? "▼" : "▶"}
                    </button>
                ) : (
                    <span style={{ marginRight: "6px", width: "20px", display: "inline-block" }} />
                )}
                <span style={{ fontSize: nivel === 0 ? "11px" : "13px" }}>
          {nivel === 0 ? "" : "•"}
        </span>
                <span style={{
                    marginLeft: "6px", fontSize: "14px",
                    fontWeight: nivel === 0 ? "600" : "400",
                    color: "var(--color-text-primary)",
                }}>
          {nodo.nombre}
        </span>
                <span style={{
                    marginLeft: "8px", fontSize: "11px",
                    color: "var(--color-text-secondary)",
                }}>
          (id: {nodo.id})
        </span>
            </div>

            {tieneHijos && expandido &&
                nodo.hijos.map(hijo => (
                    <NodoArbol key={hijo.id} nodo={hijo} nivel={nivel + 1} />
                ))
            }
        </div>
    );
}

export default function GestionCaracteristicas() {
    const [arbol, setArbol] = useState([]);
    const [todasPlanas, setTodasPlanas] = useState([]); // lista plana de TODAS las características
    const [nombre, setNombre] = useState("");
    const [padreId, setPadreId] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [msg, setMsg] = useState({ tipo: "", texto: "" });

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/public/caracteristicas`);
            const data = await res.json();
            setArbol(data);
            setTodasPlanas(aplanarArbol(data));
        } catch {
            setMsg({ tipo: "error", texto: "Error al cargar las características." });
        }
    };

    const guardar = async () => {
        if (!nombre.trim()) {
            setMsg({ tipo: "error", texto: "El nombre es obligatorio." });
            return;
        }

        setGuardando(true);
        setMsg({ tipo: "", texto: "" });

        try {
            const res = await fetch(`${BASE_URL}/api/admin/caracteristicas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    padreId: padreId ? Number(padreId) : null,
                }),
            });

            if (!res.ok) throw new Error("Error al guardar");

            setNombre("");
            setPadreId("");
            setMsg({ tipo: "success", texto: `Característica "${nombre.trim()}" creada correctamente.` });
            cargar();
        } catch {
            setMsg({ tipo: "error", texto: "No se pudo crear la característica." });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Gestión de Características</h1>
            </div>

            {/* Formulario nueva característica */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "16px", marginBottom: "1rem" }}>Nueva Característica</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "520px" }}>
                    <div className="form-group">
                        <label>Nombre *</label>
                        <input
                            type="text" value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder="Ej: TypeScript, Docker, React Native..."
                            onKeyDown={e => e.key === "Enter" && guardar()}
                        />
                    </div>

                    <div className="form-group">
                        <label>Categoría padre (opcional)</label>
                        <select value={padreId} onChange={e => setPadreId(e.target.value)}>
                            <option value="">— Sin padre (crear categoría raíz) —</option>
                            {todasPlanas.map(c => (
                                <option key={c.id} value={c.id}>
                                    {"　".repeat(c.nivel)}{c.nivel > 0 ? "↳ " : ""}{c.nombre}
                                </option>
                            ))}
                        </select>
                        <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
              Podés seleccionar cualquier característica como padre, no solo las raíz.
            </span>
                    </div>

                    {msg.texto && (
                        <p className={msg.tipo === "error" ? "msg-error" : "msg-success"} style={{ margin: 0 }}>
                            {msg.texto}
                        </p>
                    )}

                    <button
                        onClick={guardar}
                        disabled={guardando}
                        style={{
                            alignSelf: "flex-start", padding: "9px 24px",
                            background: "var(--color-primary)", color: "#fff",
                            border: "none", borderRadius: "var(--border-radius-md)",
                            cursor: guardando ? "not-allowed" : "pointer",
                            fontWeight: 600, opacity: guardando ? 0.7 : 1,
                        }}
                    >
                        {guardando ? "Guardando..." : "Agregar"}
                    </button>
                </div>
            </div>

            {/* Árbol visual */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{
                    padding: "12px 16px",
                    background: "var(--color-primary)", color: "#fff",
                    fontWeight: "600", fontSize: "14px",
                }}>
                    Árbol de Características ({todasPlanas.length} total)
                </div>

                {arbol.length === 0 ? (
                    <p className="msg-empty" style={{ padding: "2rem" }}>No hay características registradas.</p>
                ) : (
                    arbol.map(nodo => <NodoArbol key={nodo.id} nodo={nodo} nivel={0} />)
                )}
            </div>
        </div>
    );
}