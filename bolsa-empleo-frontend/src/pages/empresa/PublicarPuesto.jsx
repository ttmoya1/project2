import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCaracteristicasPublicas, publicarPuesto } from "../../api/api";

function NodoCaracteristica({ nodo, seleccionadas, onToggle, onNivel }) {
    const [expandido, setExpandido] = useState(false);
    const tieneHijos = nodo.hijos && nodo.hijos.length > 0;
    const sel = seleccionadas[nodo.id];

    return (
        <div style={{ marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {tieneHijos ? (
                    <button
                        type="button"
                        onClick={() => setExpandido(!expandido)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 12, padding: "0 4px", minWidth: 16 }}
                    >
                        {expandido ? "▼" : "▶"}
                    </button>
                ) : (
                    <span style={{ minWidth: 16 }} />
                )}
                <input
                    type="checkbox"
                    id={`car-${nodo.id}`}
                    checked={!!sel}
                    onChange={() => onToggle(nodo.id, nodo.nombre)}
                    style={{ cursor: "pointer" }}
                />
                <label htmlFor={`car-${nodo.id}`} style={{ cursor: "pointer", fontSize: 14 }}>
                    {nodo.nombre}
                </label>
                {sel && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
                        <label style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Nivel:</label>
                        <select
                            value={sel.nivel}
                            onChange={(e) => onNivel(nodo.id, Number(e.target.value))}
                            style={{ padding: "2px 6px", border: "1px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-sm)", fontSize: 13 }}
                        >
                            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                )}
            </div>
            {tieneHijos && expandido && (
                <div style={{ paddingLeft: 28, marginTop: 4 }}>
                    {nodo.hijos.map((hijo) => (
                        <NodoCaracteristica key={hijo.id} nodo={hijo} seleccionadas={seleccionadas} onToggle={onToggle} onNivel={onNivel} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PublicarPuesto() {
    const navigate = useNavigate();
    const [arbol, setArbol] = useState([]);
    const [seleccionadas, setSeleccionadas] = useState({});
    const [descripcion, setDescripcion] = useState("");
    const [salario, setSalario] = useState("");
    const [tipo, setTipo] = useState("PUBLICO");
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await getCaracteristicasPublicas();
                if (!res.ok) throw new Error("Error al cargar características");
                const data = await res.json();
                setArbol(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const handleToggle = (id, nombre) => {
        setSeleccionadas((prev) => {
            if (prev[id]) { const c = { ...prev }; delete c[id]; return c; }
            return { ...prev, [id]: { nombre, nivel: 1 } };
        });
    };

    const handleNivel = (id, nivel) => {
        setSeleccionadas((prev) => ({ ...prev, [id]: { ...prev[id], nivel } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setExito("");
        if (!descripcion.trim()) return setError("La descripción es obligatoria.");
        if (!salario || isNaN(salario) || Number(salario) <= 0) return setError("El salario debe ser un número mayor a 0.");
        if (Object.keys(seleccionadas).length === 0) return setError("Debe seleccionar al menos una característica.");

        const payload = {
            descripcion: descripcion.trim(),
            salario: Number(salario),
            tipo,
            caracteristicas: Object.entries(seleccionadas).map(([id, { nivel }]) => ({
                caracteristicaId: Number(id),
                nivelRequerido: nivel,
            })),
        };

        setEnviando(true);
        try {
            const res = await publicarPuesto(payload);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || "Error al publicar el puesto.");
            }
            setExito("Puesto publicado exitosamente.");
            setDescripcion(""); setSalario(""); setTipo("PUBLICO"); setSeleccionadas({});
        } catch (e) {
            setError(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Publicar Puesto</h1>
                <p style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>Complete el formulario para publicar un nuevo puesto de trabajo.</p>
            </div>

            {error && <p className="msg-error">{error}</p>}
            {exito && (
                <div style={{ marginBottom: 16 }}>
                    <p className="msg-success">{exito}</p>
                    <button
                        onClick={() => navigate("/empresa/puestos")}
                        style={{ marginTop: 8, padding: "8px 16px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontWeight: 600 }}
                    >
                        Ver mis puestos
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="card" style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 17, marginBottom: 16 }}>Información del Puesto</h2>
                    <div className="form-group">
                        <label>Descripción del puesto *</label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción general del puesto..."
                            rows={4}
                            style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
                        />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div className="form-group">
                            <label>Salario ofrecido (₡) *</label>
                            <input
                                type="number" value={salario}
                                onChange={(e) => setSalario(e.target.value)}
                                placeholder="Ej: 800000" min="0"
                                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", fontSize: 14, boxSizing: "border-box" }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Tipo de publicación *</label>
                            <select
                                value={tipo} onChange={(e) => setTipo(e.target.value)}
                                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", fontSize: 14, boxSizing: "border-box", background: "var(--color-background-primary)" }}
                            >
                                <option value="PUBLICO">Público</option>
                                <option value="PRIVADO">Privado</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 17, marginBottom: 4 }}>Características Requeridas *</h2>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>Seleccione las características y establezca el nivel mínimo requerido (1–5).</p>
                    {loading ? <p className="msg-empty">Cargando características...</p> : arbol.length === 0 ? <p className="msg-empty">No hay características disponibles.</p> : (
                        <div style={{ padding: 4 }}>
                            {arbol.map((nodo) => (
                                <NodoCaracteristica key={nodo.id} nodo={nodo} seleccionadas={seleccionadas} onToggle={handleToggle} onNivel={handleNivel} />
                            ))}
                        </div>
                    )}
                    {Object.keys(seleccionadas).length > 0 && (
                        <div style={{ marginTop: 16, padding: 12, background: "var(--color-background-info)", borderRadius: "var(--border-radius-md)" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-info)", marginBottom: 8 }}>Seleccionadas ({Object.keys(seleccionadas).length}):</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {Object.entries(seleccionadas).map(([id, { nombre, nivel }]) => (
                                    <span key={id} className="badge badge-blue">{nombre} — Nivel {nivel}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        type="submit" disabled={enviando}
                        style={{ padding: "12px 28px", background: enviando ? "var(--color-text-secondary)" : "var(--color-primary)", color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", cursor: enviando ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 15 }}
                    >
                        {enviando ? "Publicando..." : "Publicar Puesto"}
                    </button>
                    <button
                        type="button" onClick={() => navigate("/empresa/puestos")}
                        style={{ padding: "12px 28px", background: "none", color: "var(--color-text-secondary)", border: "1px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontWeight: 600, fontSize: 15 }}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}
