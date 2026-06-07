import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    getMisPuestos,
    hacerPrivadoPuesto,
    hacerPublicoPuesto,
    desactivarPuesto,
    getCaracteristicasPublicas,
} from "../../api/api";

const NIVELES = [
    { valor: 1, label: "Básico" },
    { valor: 2, label: "Intermedio" },
    { valor: 3, label: "Avanzado" },
    { valor: 4, label: "Experto" },
    { valor: 5, label: "Máster" },
];

const nivelLabel = (n) => NIVELES.find((x) => x.valor === Number(n))?.label ?? `Nivel ${n}`;

const BASE_URL = "http://localhost:8080";
const getToken = () => localStorage.getItem("token");

// ─── Árbol recursivo para el modal de edición ───────────────────────────────
function FilaCaracteristicaEditar({ nodo, seleccionadas, onToggle, onNivel, profundidad = 0 }) {
    const [expandido, setExpandido] = useState(true);
    const tieneHijos = nodo.hijos && nodo.hijos.length > 0;
    const sel = seleccionadas[nodo.id];

    return (
        <div>
            <div style={{
                display: "grid",
                gridTemplateColumns: tieneHijos ? "20px minmax(0,1fr)" : "20px 16px minmax(0,1fr) auto",
                alignItems: "center",
                gap: 6,
                padding: "5px 8px",
                paddingLeft: `${8 + profundidad * 16}px`,
                borderRadius: "var(--border-radius-md)",
                background: sel ? "var(--color-background-info)" : "transparent",
                transition: "background 0.15s",
            }}>
                {tieneHijos ? (
                    <>
                        <button
                            type="button"
                            onClick={() => setExpandido(e => !e)}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                padding: 0, fontSize: 9, color: "var(--color-text-secondary)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                lineHeight: 1,
                            }}
                        >
                            {expandido ? "▼" : "▶"}
                        </button>
                        <span style={{
                            fontSize: profundidad === 0 ? 11 : 13,
                            fontWeight: profundidad === 0 ? 600 : 500,
                            color: profundidad === 0 ? "var(--color-text-secondary)" : "var(--color-text-primary)",
                            textTransform: profundidad === 0 ? "uppercase" : "none",
                            letterSpacing: profundidad === 0 ? "0.05em" : "normal",
                            userSelect: "none",
                        }}>
                            {nodo.nombre}
                        </span>
                    </>
                ) : (
                    <>
                        <span />
                        <input
                            type="checkbox"
                            id={`edit-c-${nodo.id}`}
                            checked={!!sel}
                            onChange={() => onToggle(nodo.id, nodo.nombre)}
                            style={{ cursor: "pointer", accentColor: "var(--color-border-info)", margin: 0, width: 14, height: 14 }}
                        />
                        <label
                            htmlFor={`edit-c-${nodo.id}`}
                            style={{
                                fontSize: 13, cursor: "pointer",
                                color: sel ? "var(--color-text-info)" : "var(--color-text-primary)",
                                fontWeight: sel ? 500 : 400,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                        >
                            {nodo.nombre}
                        </label>
                        {sel ? (
                            <select
                                value={sel.nivel}
                                onChange={(e) => onNivel(nodo.id, Number(e.target.value))}
                                style={{
                                    fontSize: 12, padding: "2px 4px",
                                    border: "0.5px solid var(--color-border-info)",
                                    borderRadius: "var(--border-radius-md)",
                                    background: "var(--color-background-primary)",
                                    color: "var(--color-text-info)",
                                    cursor: "pointer", width: 90, flexShrink: 0,
                                }}
                            >
                                {NIVELES.map(n => (
                                    <option key={n.valor} value={n.valor}>{n.label}</option>
                                ))}
                            </select>
                        ) : (
                            <span style={{ width: 90 }} />
                        )}
                    </>
                )}
            </div>

            {tieneHijos && expandido && (
                <div style={{
                    borderLeft: profundidad === 0 ? "none" : "1.5px solid var(--color-border-tertiary)",
                    marginLeft: profundidad === 0 ? 0 : `${8 + profundidad * 16 + 10}px`,
                }}>
                    {nodo.hijos.map(hijo => (
                        <FilaCaracteristicaEditar
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

// ─── Modal de edición ────────────────────────────────────────────────────────
function ModalEditar({ puesto, onCerrar, onGuardado }) {
    const [descripcion, setDescripcion] = useState(puesto.descripcion || "");
    const [salario, setSalario] = useState(puesto.salario?.toString() || "");
    const [tipo, setTipo] = useState(puesto.tipo || "PUBLICO");
    const [seleccionadas, setSeleccionadas] = useState(() => {
        const inicial = {};
        (puesto.caracteristicas || []).forEach(c => {
            inicial[c.caracteristicaId] = { nombre: c.caracteristicaNombre, nivel: c.nivelRequerido };
        });
        return inicial;
    });
    const [arbol, setArbol] = useState([]);
    const [cargandoArbol, setCargandoArbol] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getCaracteristicasPublicas()
            .then(r => r.json())
            .then(setArbol)
            .catch(() => setError("Error al cargar características"))
            .finally(() => setCargandoArbol(false));
    }, []);

    const handleToggle = (id, nombre) => {
        setSeleccionadas(prev => {
            if (prev[id]) { const c = { ...prev }; delete c[id]; return c; }
            return { ...prev, [id]: { nombre, nivel: 1 } };
        });
    };

    const handleNivel = (id, nivel) => {
        setSeleccionadas(prev => ({ ...prev, [id]: { ...prev[id], nivel } }));
    };

    const handleGuardar = async () => {
        setError("");
        if (!descripcion.trim()) return setError("La descripción es obligatoria.");
        if (!salario || isNaN(salario) || Number(salario) <= 0)
            return setError("El salario debe ser mayor a 0.");
        if (Object.keys(seleccionadas).length === 0)
            return setError("Seleccioná al menos una característica.");

        setGuardando(true);
        try {
            const payload = {
                descripcion: descripcion.trim(),
                salario: Number(salario),
                tipo,
                caracteristicas: Object.entries(seleccionadas).map(([id, { nivel }]) => ({
                    caracteristicaId: Number(id),
                    nivelRequerido: nivel,
                })),
            };



            const token = getToken();

            // 1. Cambiar tipo si difiere
            if (tipo !== puesto.tipo) {
                const urlTipo = tipo === "PUBLICO"
                    ? `${BASE_URL}/api/empresa/puestos/${puesto.id}/publico`
                    : `${BASE_URL}/api/empresa/puestos/${puesto.id}/privado`;
                await fetch(urlTipo, {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            // 2. Editar descripción, salario y características via PUT completo
            const res = await fetch(`${BASE_URL}/api/empresa/puestos/${puesto.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                // Si el backend no tiene ese endpoint aún, mostramos aviso útil
                if (res.status === 405 || res.status === 404) {
                    throw new Error("El servidor aún no soporta edición completa. Solo se puede cambiar el tipo de visibilidad por ahora.");
                }
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || "Error al guardar los cambios.");
            }

            onGuardado();
        } catch (e) {
            setError(e.message);
        } finally {
            setGuardando(false);
        }
    };

    const totalSel = Object.keys(seleccionadas).length;

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            zIndex: 300, display: "flex", alignItems: "flex-start",
            justifyContent: "center", padding: "2rem 1rem", overflowY: "auto",
        }}
             onClick={onCerrar}
        >
            <div style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-secondary)",
                borderRadius: "var(--border-radius-lg)",
                width: "100%", maxWidth: 780,
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                overflow: "hidden",
            }}
                 onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "1rem 1.5rem",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    background: "var(--color-background-secondary)",
                }}>
                    <h2 style={{ fontSize: 16, margin: 0 }}>Editar puesto</h2>
                    <button
                        type="button"
                        onClick={onCerrar}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: 22, color: "var(--color-text-secondary)",
                            lineHeight: 1, padding: "0 4px",
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Contenido */}
                <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

                    {/* Columna izquierda: datos + resumen */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div className="form-group">
                            <label>Descripción *</label>
                            <textarea
                                value={descripcion}
                                onChange={e => setDescripcion(e.target.value)}
                                rows={4}
                                style={{ resize: "vertical", width: "100%", boxSizing: "border-box" }}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div className="form-group">
                                <label>Salario (₡) *</label>
                                <input
                                    type="number"
                                    value={salario}
                                    onChange={e => setSalario(e.target.value)}
                                    min="0"
                                    style={{ width: "100%", boxSizing: "border-box" }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Tipo *</label>
                                <select
                                    value={tipo}
                                    onChange={e => setTipo(e.target.value)}
                                    style={{ width: "100%", boxSizing: "border-box" }}
                                >
                                    <option value="PUBLICO">Público</option>
                                    <option value="PRIVADO">Privado</option>
                                </select>
                            </div>
                        </div>

                        {/* Resumen seleccionadas */}
                        <div style={{
                            background: "var(--color-background-secondary)",
                            border: "0.5px solid var(--color-border-tertiary)",
                            borderRadius: "var(--border-radius-md)",
                            padding: "12px",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", margin: 0 }}>
                                    SELECCIONADAS
                                </p>
                                <span style={{
                                    fontSize: 11, fontWeight: 500,
                                    background: totalSel > 0 ? "var(--color-background-info)" : "var(--color-background-tertiary)",
                                    color: totalSel > 0 ? "var(--color-text-info)" : "var(--color-text-secondary)",
                                    padding: "1px 8px", borderRadius: 999,
                                }}>
                                    {totalSel}
                                </span>
                            </div>
                            {totalSel === 0 ? (
                                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>
                                    Ninguna seleccionada
                                </p>
                            ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                    {Object.entries(seleccionadas).map(([id, { nombre, nivel }]) => (
                                        <div key={id} style={{
                                            display: "flex", alignItems: "center", gap: 4,
                                            background: "var(--color-background-info)",
                                            border: "0.5px solid var(--color-border-info)",
                                            borderRadius: 999, padding: "2px 8px 2px 10px",
                                            fontSize: 11,
                                        }}>
                                            <span style={{ color: "var(--color-text-info)", fontWeight: 500 }}>
                                                {nombre}
                                            </span>
                                            <span style={{ color: "var(--color-text-secondary)", fontSize: 10 }}>
                                                · {nivelLabel(nivel)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSeleccionadas(prev => {
                                                        const c = { ...prev };
                                                        delete c[Number(id)];
                                                        return c;
                                                    });
                                                }}
                                                style={{
                                                    background: "none", border: "none", cursor: "pointer",
                                                    color: "var(--color-text-secondary)", fontSize: 13,
                                                    lineHeight: 1, padding: "0 0 0 2px",
                                                }}
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && <p className="msg-error" style={{ margin: 0 }}>{error}</p>}

                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                type="button"
                                onClick={handleGuardar}
                                disabled={guardando}
                                style={{
                                    flex: 1, padding: "9px 0",
                                    background: guardando ? "var(--color-text-secondary)" : "var(--color-primary)",
                                    color: "#fff", border: "none",
                                    borderRadius: "var(--border-radius-md)",
                                    cursor: guardando ? "not-allowed" : "pointer",
                                    fontWeight: 500, fontSize: 14,
                                }}
                            >
                                {guardando ? "Guardando..." : "Guardar cambios"}
                            </button>
                            <button type="button" onClick={onCerrar} style={{ padding: "9px 16px" }}>
                                Cancelar
                            </button>
                        </div>
                    </div>

                    {/* Columna derecha: árbol */}
                    <div style={{
                        background: "var(--color-background-secondary)",
                        border: "0.5px solid var(--color-border-tertiary)",
                        borderRadius: "var(--border-radius-md)",
                        padding: "12px",
                        maxHeight: "60vh",
                        overflowY: "auto",
                    }}>
                        <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-secondary)", margin: "0 0 10px" }}>
                            Características requeridas
                        </p>
                        {cargandoArbol ? (
                            <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Cargando...</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {arbol.map(raiz => (
                                    <div key={raiz.id} style={{ marginBottom: 6 }}>
                                        <FilaCaracteristicaEditar
                                            nodo={raiz}
                                            seleccionadas={seleccionadas}
                                            onToggle={handleToggle}
                                            onNivel={handleNivel}
                                            profundidad={0}
                                        />
                                        <div style={{ height: 1, background: "var(--color-border-tertiary)", marginTop: 4 }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Tarjeta de puesto ────────────────────────────────────────────────────────
function TarjetaPuesto({ puesto, procesando, onCambiarVisibilidad, onDesactivar, onVerCandidatos, onEditar }) {
    const esPublico = puesto.tipo === "PUBLICO";
    const estaActivo = puesto.activo;

    return (
        <div className="card" style={{ opacity: estaActivo ? 1 : 0.6 }}>
            <div className="flex-between" style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span className={`badge ${estaActivo ? "badge-green" : "badge-red"}`}>
                        {estaActivo ? "Activo" : "Inactivo"}
                    </span>
                    <span className={`badge ${esPublico ? "badge-blue" : "badge-gray"}`}>
                        {esPublico ? " Público" : " Privado"}
                    </span>
                </div>
                <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
                    {puesto.fechaRegistro ? new Date(puesto.fechaRegistro).toLocaleDateString("es-CR") : ""}
                </p>
            </div>

            <h3 style={{ marginBottom: 6, fontSize: 16 }}>{puesto.descripcion}</h3>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: 10 }}>
                Salario: <strong>₡{puesto.salario?.toLocaleString()}</strong>
            </p>

            {puesto.caracteristicas && puesto.caracteristicas.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 6 }}>Requisitos:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {puesto.caracteristicas.map((c) => (
                            <span key={c.caracteristicaId} className="badge badge-blue">
                                {c.caracteristicaNombre} — {nivelLabel(c.nivelRequerido)}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {/* Ver candidatos */}
                <button onClick={onVerCandidatos} style={{
                    padding: "8px 16px",
                    background: "var(--color-background-info)", color: "var(--color-text-info)",
                    border: "1px solid var(--color-border-info)",
                    borderRadius: "var(--border-radius-sm)", cursor: "pointer", fontWeight: 600, fontSize: 14,
                }}>
                    Ver candidatos
                </button>

                {/* Editar — solo si está activo */}
                {estaActivo && onEditar && (
                    <button
                        onClick={onEditar}
                        disabled={procesando}
                        style={{
                            padding: "8px 16px",
                            background: "var(--color-background-secondary)",
                            color: "var(--color-text-primary)",
                            border: "1px solid var(--color-border-secondary)",
                            borderRadius: "var(--border-radius-sm)",
                            cursor: procesando ? "not-allowed" : "pointer",
                            fontWeight: 600, fontSize: 14,
                            opacity: procesando ? 0.6 : 1,
                        }}
                    >
                        ✏️ Editar
                    </button>
                )}

                {/* Cambiar visibilidad */}
                {estaActivo && onCambiarVisibilidad && (
                    <button
                        onClick={onCambiarVisibilidad}
                        disabled={procesando}
                        title={esPublico ? "Cambiar a privado" : "Cambiar a público"}
                        style={{
                            padding: "8px 16px",
                            background: esPublico ? "var(--color-background-secondary)" : "var(--color-background-success)",
                            color: esPublico ? "var(--color-text-secondary)" : "var(--color-text-success)",
                            border: `1px solid ${esPublico ? "var(--color-border-secondary)" : "var(--color-text-success)"}`,
                            borderRadius: "var(--border-radius-sm)", cursor: procesando ? "not-allowed" : "pointer",
                            fontWeight: 600, fontSize: 14, opacity: procesando ? 0.6 : 1,
                        }}
                    >
                        {procesando ? "..." : esPublico ? " Hacer privado" : " Hacer público"}
                    </button>
                )}

                {/* Desactivar */}
                {estaActivo && onDesactivar && (
                    <button
                        onClick={onDesactivar}
                        disabled={procesando}
                        style={{
                            padding: "8px 16px",
                            background: "var(--color-background-danger)", color: "var(--color-text-danger)",
                            border: "1px solid var(--color-text-danger)",
                            borderRadius: "var(--border-radius-sm)", cursor: procesando ? "not-allowed" : "pointer",
                            fontWeight: 600, fontSize: 14, opacity: procesando ? 0.6 : 1,
                        }}
                    >
                        {procesando ? "..." : "Desactivar"}
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function MisPuestos() {
    const navigate = useNavigate();
    const [puestos, setPuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [procesando, setProcesando] = useState(null);
    const [puestoEditando, setPuestoEditando] = useState(null);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setLoading(true); setError("");
        try {
            const res = await getMisPuestos();
            if (!res.ok) throw new Error("Error al cargar puestos");
            setPuestos(await res.json());
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    const cambiarVisibilidad = async (puesto) => {
        setProcesando(puesto.id);
        try {
            const res = puesto.tipo === "PUBLICO"
                ? await hacerPrivadoPuesto(puesto.id)
                : await hacerPublicoPuesto(puesto.id);
            if (!res.ok) throw new Error();
            setPuestos(prev => prev.map(p =>
                p.id === puesto.id
                    ? { ...p, tipo: puesto.tipo === "PUBLICO" ? "PRIVADO" : "PUBLICO" }
                    : p
            ));
        } catch {
            alert("No se pudo cambiar la visibilidad del puesto.");
        } finally { setProcesando(null); }
    };

    const handleDesactivar = async (id) => {
        if (!confirm("¿Seguro que desea desactivar este puesto? Ya no aparecerá en ninguna búsqueda.")) return;
        setProcesando(id);
        try {
            const res = await desactivarPuesto(id);
            if (!res.ok) throw new Error();
            setPuestos(prev => prev.map(p => p.id === id ? { ...p, activo: false } : p));
        } catch {
            alert("No se pudo desactivar el puesto.");
        } finally { setProcesando(null); }
    };

    const handleGuardado = () => {
        setPuestoEditando(null);
        cargar(); // recargar la lista con los datos actualizados
    };

    if (loading) return <div className="page"><p className="msg-empty">Cargando puestos...</p></div>;
    if (error)   return <div className="page"><p className="msg-error">{error}</p></div>;

    const activos   = puestos.filter(p => p.activo);
    const inactivos = puestos.filter(p => !p.activo);

    return (
        <div className="page">
            {puestoEditando && (
                <ModalEditar
                    puesto={puestoEditando}
                    onCerrar={() => setPuestoEditando(null)}
                    onGuardado={handleGuardado}
                />
            )}

            <div className="page-header">
                <h1>Mis Puestos</h1>
                <button onClick={() => navigate("/empresa/puestos/nuevo")} style={{
                    padding: "10px 20px", background: "var(--color-primary)", color: "#fff",
                    border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontWeight: 600,
                }}>
                    + Publicar Puesto
                </button>
            </div>

            {puestos.length === 0 && (
                <p className="msg-empty">No tiene puestos publicados todavía.</p>
            )}

            {/* Puestos activos */}
            {activos.length > 0 && (
                <>
                    <h2 style={{ fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "12px", fontWeight: "500" }}>
                        Activos ({activos.length})
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "2rem" }}>
                        {activos.map(p => (
                            <TarjetaPuesto
                                key={p.id}
                                puesto={p}
                                procesando={procesando === p.id}
                                onCambiarVisibilidad={() => cambiarVisibilidad(p)}
                                onDesactivar={() => handleDesactivar(p.id)}
                                onVerCandidatos={() => navigate(`/empresa/puestos/${p.id}/candidatos`)}
                                onEditar={() => setPuestoEditando(p)}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Puestos inactivos */}
            {inactivos.length > 0 && (
                <>
                    <h2 style={{ fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "12px", fontWeight: "500" }}>
                        Inactivos ({inactivos.length})
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {inactivos.map(p => (
                            <TarjetaPuesto
                                key={p.id}
                                puesto={p}
                                procesando={procesando === p.id}
                                onCambiarVisibilidad={null}
                                onDesactivar={null}
                                onVerCandidatos={() => navigate(`/empresa/puestos/${p.id}/candidatos`)}
                                onEditar={null}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}