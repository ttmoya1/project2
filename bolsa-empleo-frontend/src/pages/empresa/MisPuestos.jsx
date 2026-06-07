import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMisPuestos, hacerPrivadoPuesto, hacerPublicoPuesto, desactivarPuesto } from "../../api/api";

const NIVELES = { 1: "Básico", 2: "Intermedio", 3: "Avanzado", 4: "Experto", 5: "Master" };

export default function MisPuestos() {
    const navigate = useNavigate();
    const [puestos, setPuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [procesando, setProcesando] = useState(null); // id del puesto en proceso

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
            // Si está público → pasa a privado. Si está privado → pasa a público.
            const res = puesto.tipo === "PUBLICO"
                ? await hacerPrivadoPuesto(puesto.id)
                : await hacerPublicoPuesto(puesto.id);
            if (!res.ok) throw new Error();
            // Actualizar localmente sin recargar toda la lista
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

    if (loading) return <div className="page"><p className="msg-empty">Cargando puestos...</p></div>;
    if (error)   return <div className="page"><p className="msg-error">{error}</p></div>;

    const activos   = puestos.filter(p => p.activo);
    const inactivos = puestos.filter(p => !p.activo);

    return (
        <div className="page">
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

            {/* ── Puestos activos ── */}
            {activos.length > 0 && (
                <>
                    <h2 style={{ fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "12px", fontWeight: "500" }}>
                        Activos ({activos.length})
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "2rem" }}>
                        {activos.map(p => (
                            <TarjetaPuesto
                                key={p.id} puesto={p}
                                procesando={procesando === p.id}
                                onCambiarVisibilidad={() => cambiarVisibilidad(p)}
                                onDesactivar={() => handleDesactivar(p.id)}
                                onVerCandidatos={() => navigate(`/empresa/puestos/${p.id}/candidatos`)}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* ── Puestos inactivos ── */}
            {inactivos.length > 0 && (
                <>
                    <h2 style={{ fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "12px", fontWeight: "500" }}>
                        Inactivos ({inactivos.length})
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {inactivos.map(p => (
                            <TarjetaPuesto
                                key={p.id} puesto={p}
                                procesando={procesando === p.id}
                                onCambiarVisibilidad={null}
                                onDesactivar={null}
                                onVerCandidatos={() => navigate(`/empresa/puestos/${p.id}/candidatos`)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function TarjetaPuesto({ puesto, procesando, onCambiarVisibilidad, onDesactivar, onVerCandidatos }) {
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
            {esPublico ? "🌐 Público" : "🔒 Privado"}
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
                {c.caracteristicaNombre} — {NIVELES[c.nivelRequerido] || c.nivelRequerido}
              </span>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {/* Ver candidatos siempre disponible */}
                <button onClick={onVerCandidatos} style={{
                    padding: "8px 16px",
                    background: "var(--color-background-info)", color: "var(--color-text-info)",
                    border: "1px solid var(--color-border-info)",
                    borderRadius: "var(--border-radius-sm)", cursor: "pointer", fontWeight: 600, fontSize: 14,
                }}>
                    Ver candidatos
                </button>

                {/* Cambiar visibilidad: solo si está activo */}
                {estaActivo && onCambiarVisibilidad && (
                    <button
                        onClick={onCambiarVisibilidad}
                        disabled={procesando}
                        title={esPublico ? "Cambiar a privado (solo oferentes registrados)" : "Cambiar a público (visible para todos)"}
                        style={{
                            padding: "8px 16px",
                            background: esPublico ? "var(--color-background-secondary)" : "var(--color-background-success)",
                            color: esPublico ? "var(--color-text-secondary)" : "var(--color-text-success)",
                            border: `1px solid ${esPublico ? "var(--color-border-secondary)" : "var(--color-text-success)"}`,
                            borderRadius: "var(--border-radius-sm)", cursor: procesando ? "not-allowed" : "pointer",
                            fontWeight: 600, fontSize: 14, opacity: procesando ? 0.6 : 1,
                        }}
                    >
                        {procesando ? "..." : esPublico ? "🔒 Hacer privado" : "🌐 Hacer público"}
                    </button>
                )}

                {/* Desactivar: solo si está activo */}
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