import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCaracteristicasPublicas, publicarPuesto } from "../../api/api";

const NIVELES = [
    { valor: 1, label: "Básico" },
    { valor: 2, label: "Intermedio" },
    { valor: 3, label: "Avanzado" },
    { valor: 4, label: "Experto" },
    { valor: 5, label: "Máster" },
];

function FilaCaracteristica({ nodo, seleccionadas, onToggle, onNivel }) {
    const sel = seleccionadas[nodo.id];

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "20px 1fr auto",
            alignItems: "center",
            gap: 8,
            padding: "6px 8px",
            borderRadius: "var(--border-radius-md)",
            background: sel ? "var(--color-background-info)" : "transparent",
            transition: "background 0.15s",
            minWidth: 0,
        }}>
            <input
                type="checkbox"
                id={`c-${nodo.id}`}
                checked={!!sel}
                onChange={() => onToggle(nodo.id, nodo.nombre)}
                style={{ cursor: "pointer", accentColor: "var(--color-border-info)", margin: 0 }}
            />
            <label
                htmlFor={`c-${nodo.id}`}
                style={{
                    fontSize: 13,
                    cursor: "pointer",
                    color: sel ? "var(--color-text-info)" : "var(--color-text-primary)",
                    fontWeight: sel ? 500 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                }}
                title={nodo.nombre}
            >
                {nodo.nombre}
            </label>
            {sel ? (
                <select
                    value={sel.nivel}
                    onChange={(e) => onNivel(nodo.id, Number(e.target.value))}
                    style={{
                        fontSize: 12,
                        padding: "2px 4px",
                        border: "0.5px solid var(--color-border-info)",
                        borderRadius: "var(--border-radius-md)",
                        background: "var(--color-background-primary)",
                        color: "var(--color-text-info)",
                        cursor: "pointer",
                        width: 100,
                        flexShrink: 0,
                    }}
                >
                    {NIVELES.map((n) => (
                        <option key={n.valor} value={n.valor}>{n.label}</option>
                    ))}
                </select>
            ) : (
                <span style={{ width: 100 }} />
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
        getCaracteristicasPublicas()
            .then((r) => r.json())
            .then(setArbol)
            .catch(() => setError("Error al cargar características"))
            .finally(() => setLoading(false));
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

    const handleQuitar = (id) => {
        setSeleccionadas((prev) => { const c = { ...prev }; delete c[Number(id)]; return c; });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setExito("");
        if (!descripcion.trim()) return setError("La descripción es obligatoria.");
        if (!salario || isNaN(salario) || Number(salario) <= 0)
            return setError("El salario debe ser un número mayor a 0.");
        if (Object.keys(seleccionadas).length === 0)
            return setError("Debe seleccionar al menos una característica.");

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
            setExito("¡Puesto publicado exitosamente!");
            setDescripcion(""); setSalario(""); setTipo("PUBLICO"); setSeleccionadas({});
        } catch (e) {
            setError(e.message);
        } finally {
            setEnviando(false);
        }
    };

    const totalSeleccionadas = Object.keys(seleccionadas).length;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Publicar puesto</h1>
                    <p style={{ color: "var(--color-text-secondary)", marginTop: 4, fontSize: 14 }}>
                        Complete el formulario para publicar una nueva vacante.
                    </p>
                </div>
            </div>

            {error && <p className="msg-error" style={{ marginBottom: 16 }}>{error}</p>}

            {exito && (
                <div style={{ marginBottom: 16 }}>
                    <p className="msg-success">{exito}</p>
                    <button
                        onClick={() => navigate("/empresa/puestos")}
                        style={{ marginTop: 8, padding: "8px 16px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontWeight: 500 }}
                    >
                        Ver mis puestos
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20, alignItems: "start" }}>

                    {/* ── Columna izquierda ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

                        {/* Datos del puesto */}
                        <div className="card">
                            <h2 style={{ fontSize: 15, marginBottom: 14 }}>Información del puesto</h2>

                            <div className="form-group" style={{ marginBottom: 12 }}>
                                <label>Descripción *</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Ej: Desarrollador Full Stack con experiencia en React y Spring Boot..."
                                    rows={4}
                                    style={{ resize: "vertical", width: "100%", boxSizing: "border-box" }}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
                                <div className="form-group">
                                    <label>Salario (₡) *</label>
                                    <input
                                        type="number"
                                        value={salario}
                                        onChange={(e) => setSalario(e.target.value)}
                                        placeholder="800000"
                                        min="0"
                                        style={{ width: "100%", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tipo *</label>
                                    <select
                                        value={tipo}
                                        onChange={(e) => setTipo(e.target.value)}
                                        style={{ width: "100%", boxSizing: "border-box" }}
                                    >
                                        <option value="PUBLICO">Público</option>
                                        <option value="PRIVADO">Privado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Resumen seleccionadas */}
                        <div className="card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <h2 style={{ fontSize: 15, margin: 0 }}>Características seleccionadas</h2>
                                <span style={{
                                    fontSize: 12, fontWeight: 500,
                                    background: totalSeleccionadas > 0 ? "var(--color-background-info)" : "var(--color-background-secondary)",
                                    color: totalSeleccionadas > 0 ? "var(--color-text-info)" : "var(--color-text-secondary)",
                                    padding: "2px 10px", borderRadius: 999,
                                }}>
                  {totalSeleccionadas} seleccionada{totalSeleccionadas !== 1 ? "s" : ""}
                </span>
                            </div>

                            {totalSeleccionadas === 0 ? (
                                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", textAlign: "center", padding: "12px 0" }}>
                                    Marcá características en el panel de la derecha
                                </p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {Object.entries(seleccionadas).map(([id, { nombre, nivel }]) => {
                                        const nivelLabel = NIVELES.find((n) => n.valor === nivel)?.label || nivel;
                                        return (
                                            <div key={id} style={{
                                                display: "grid",
                                                gridTemplateColumns: "minmax(0,1fr) auto auto",
                                                alignItems: "center",
                                                gap: 8,
                                                padding: "6px 10px",
                                                background: "var(--color-background-secondary)",
                                                border: "0.5px solid var(--color-border-tertiary)",
                                                borderRadius: "var(--border-radius-md)",
                                            }}>
                        <span style={{
                            fontSize: 13,
                            color: "var(--color-text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            minWidth: 0,
                        }}>
                          {nombre}
                        </span>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 500,
                                                    background: "var(--color-background-info)",
                                                    color: "var(--color-text-info)",
                                                    padding: "2px 8px", borderRadius: 999,
                                                    whiteSpace: "nowrap",
                                                }}>
                          {nivelLabel}
                        </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuitar(id)}
                                                    title="Quitar"
                                                    style={{
                                                        background: "none", border: "none", cursor: "pointer",
                                                        color: "var(--color-text-secondary)", fontSize: 16,
                                                        lineHeight: 1, padding: "0 2px",
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Botones */}
                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                type="submit"
                                disabled={enviando}
                                style={{
                                    flex: 1, padding: "10px 0",
                                    background: enviando ? "var(--color-text-secondary)" : "var(--color-primary)",
                                    color: "#fff", border: "none",
                                    borderRadius: "var(--border-radius-md)",
                                    cursor: enviando ? "not-allowed" : "pointer",
                                    fontWeight: 500, fontSize: 14,
                                }}
                            >
                                {enviando ? "Publicando..." : "Publicar puesto"}
                            </button>
                            <button type="button" onClick={() => navigate("/empresa/puestos")} style={{ padding: "10px 20px" }}>
                                Cancelar
                            </button>
                        </div>
                    </div>

                    {/* ── Columna derecha: árbol ── */}
                    <div className="card" style={{ position: "sticky", top: 70, minWidth: 0 }}>
                        <div style={{ marginBottom: 12 }}>
                            <h2 style={{ fontSize: 15, margin: 0 }}>Características requeridas</h2>
                            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>
                                Marcá cada habilidad y elegí el nivel mínimo requerido.
                            </p>
                        </div>

                        {loading ? (
                            <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Cargando...</p>
                        ) : arbol.length === 0 ? (
                            <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>No hay características disponibles.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {arbol.map((padre) => (
                                    <div key={padre.id}>
                                        {/* Etiqueta del grupo */}
                                        <p style={{
                                            fontSize: 11, fontWeight: 500,
                                            textTransform: "uppercase", letterSpacing: "0.06em",
                                            color: "var(--color-text-secondary)",
                                            marginBottom: 4, paddingLeft: 4,
                                        }}>
                                            {padre.nombre}
                                        </p>

                                        {/* Hijos o el padre mismo si no tiene hijos */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                            {(padre.hijos && padre.hijos.length > 0 ? padre.hijos : [padre]).map((item) => (
                                                <FilaCaracteristica
                                                    key={item.id}
                                                    nodo={item}
                                                    seleccionadas={seleccionadas}
                                                    onToggle={handleToggle}
                                                    onNivel={handleNivel}
                                                />
                                            ))}
                                        </div>

                                        <div style={{ height: 1, background: "var(--color-border-tertiary)", marginTop: 8 }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </form>
        </div>
    );
}