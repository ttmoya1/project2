import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMisPuestos, desactivarPuesto } from "../../api/api";
import { nivelLabel } from "../../utils/nivelUtils";

export default function MisPuestos() {
    const navigate = useNavigate();
    const [puestos, setPuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mensajes, setMensajes] = useState({});
    const [desactivando, setDesactivando] = useState(null);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setLoading(true); setError("");
        try {
            const res = await getMisPuestos();
            if (!res.ok) throw new Error("Error al cargar puestos");
            const data = await res.json();
            setPuestos(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDesactivar = async (id) => {
        if (!confirm("¿Seguro que desea desactivar este puesto?")) return;
        setDesactivando(id);
        try {
            const res = await desactivarPuesto(id);
            if (!res.ok) throw new Error("No se pudo desactivar el puesto");
            setMensajes(prev => ({ ...prev, [id]: { tipo: "success", texto: "Puesto desactivado correctamente." } }));
            setPuestos(prev => prev.map(p => p.id === id ? { ...p, activo: false } : p));
        } catch (e) {
            setMensajes(prev => ({ ...prev, [id]: { tipo: "error", texto: e.message } }));
        } finally {
            setDesactivando(null);
        }
    };

    if (loading) return <div className="page"><p className="msg-empty">Cargando puestos...</p></div>;
    if (error)   return <div className="page"><p className="msg-error">{error}</p></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div className="flex-between">
                    <h1>Mis Puestos</h1>
                    <button
                        onClick={() => navigate("/empresa/puestos/nuevo")}
                        style={{ padding: "10px 20px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontWeight: 600 }}
                    >
                        + Publicar Puesto
                    </button>
                </div>
            </div>

            {puestos.length === 0 ? (
                <p className="msg-empty">No tiene puestos publicados todavía.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {puestos.map((p) => (
                        <div key={p.id} className="card">
                            <div className="flex-between" style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                    <span className={`badge ${p.activo ? "badge-green" : "badge-red"}`}>
                                        {p.activo ? "Activo" : "Inactivo"}
                                    </span>
                                    <span className={`badge ${p.tipo === "PUBLICO" ? "badge-blue" : "badge-gray"}`}>
                                        {p.tipo === "PUBLICO" ? "Público" : "Privado"}
                                    </span>
                                </div>
                                <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
                                    {p.fechaRegistro ? new Date(p.fechaRegistro).toLocaleDateString("es-CR") : ""}
                                </p>
                            </div>

                            <h3 style={{ marginBottom: 6, fontSize: 17 }}>{p.descripcion}</h3>
                            <p style={{ color: "var(--color-text-secondary)", marginBottom: 10 }}>
                                Salario: <strong>₡{p.salario?.toLocaleString()}</strong>
                            </p>

                            {p.caracteristicas && p.caracteristicas.length > 0 && (
                                <div style={{ marginBottom: 12 }}>
                                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 6 }}>Requisitos:</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {p.caracteristicas.map((c) => (
                                            <span key={c.caracteristicaId} className="badge badge-blue">
                                                {c.caracteristicaNombre} — {nivelLabel(c.nivelRequerido)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {mensajes[p.id] && (
                                <p className={mensajes[p.id].tipo === "success" ? "msg-success" : "msg-error"} style={{ marginBottom: 10 }}>
                                    {mensajes[p.id].texto}
                                </p>
                            )}

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button
                                    onClick={() => navigate(`/empresa/puestos/${p.id}/candidatos`)}
                                    style={{ padding: "8px 16px", background: "var(--color-background-info)", color: "var(--color-text-info)", border: "1px solid var(--color-border-info)", borderRadius: "var(--border-radius-sm)", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
                                >
                                    Ver Candidatos
                                </button>
                                {p.activo && (
                                    <button
                                        onClick={() => handleDesactivar(p.id)}
                                        disabled={desactivando === p.id}
                                        style={{ padding: "8px 16px", background: "var(--color-background-danger)", color: "var(--color-text-danger)", border: "1px solid var(--color-text-danger)", borderRadius: "var(--border-radius-sm)", cursor: desactivando === p.id ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14, opacity: desactivando === p.id ? 0.6 : 1 }}
                                    >
                                        {desactivando === p.id ? "Desactivando..." : "Desactivar"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}