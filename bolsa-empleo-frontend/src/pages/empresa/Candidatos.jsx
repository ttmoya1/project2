import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buscarCandidatos, getDetalleCandidato } from "../../api/api";
import { nivelLabel } from "../../utils/nivelUtils";

const BASE_URL = "http://localhost:8080";
const getToken = () => localStorage.getItem("token");

function ModalDetalle({ candidato, onCerrar }) {
    const [cargandoCV, setCargandoCV] = useState(false);
    const [cvError, setCvError] = useState("");

    const verCurriculo = async () => {
        setCvError(""); setCargandoCV(true);
        try {
            const res = await fetch(`${BASE_URL}/api/empresa/candidatos/${candidato.id}/curriculo`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) {
                if (res.status === 404) throw new Error("Este candidato no tiene currículo registrado.");
                throw new Error("No se pudo obtener el currículo.");
            }
            const blob = await res.blob();
            window.open(URL.createObjectURL(blob), "_blank");
        } catch (e) {
            setCvError(e.message);
        } finally {
            setCargandoCV(false);
        }
    };

    return (
        <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
            onClick={onCerrar}
        >
            <div
                style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", padding: 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-between" style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20 }}>{candidato.nombre} {candidato.primerApellido}</h2>
                    <button onClick={onCerrar} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--color-text-secondary)", lineHeight: 1 }}>×</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, padding: 16, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
                    <div>
                        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 2 }}>Identificación</p>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{candidato.identificacion}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 2 }}>Nacionalidad</p>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{candidato.nacionalidad}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 2 }}>Correo</p>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{candidato.correo}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 2 }}>Teléfono</p>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{candidato.telefono}</p>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 2 }}>Lugar de residencia</p>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{candidato.lugarResidencia}</p>
                    </div>
                </div>

                {candidato.habilidades && candidato.habilidades.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 15 }}>Habilidades</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {candidato.habilidades.map((h) => (
                                <span key={h.caracteristicaId} className="badge badge-blue">
                                    {h.caracteristicaNombre} — {nivelLabel(h.nivel)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {cvError && <p className="msg-error" style={{ marginBottom: 12 }}>{cvError}</p>}
                <div style={{ display: "flex", gap: 10 }}>
                    {candidato.tieneCurriculo ? (
                        <button
                            onClick={verCurriculo} disabled={cargandoCV}
                            style={{ padding: "10px 20px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", cursor: cargandoCV ? "not-allowed" : "pointer", fontWeight: 600, opacity: cargandoCV ? 0.7 : 1 }}
                        >
                            {cargandoCV ? "Abriendo..." : "Ver Currículo (PDF)"}
                        </button>
                    ) : (
                        <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>Este candidato no ha subido un currículo.</p>
                    )}
                    <button
                        onClick={onCerrar}
                        style={{ padding: "10px 20px", background: "none", border: "1px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", color: "var(--color-text-secondary)", fontWeight: 600 }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Candidatos() {
    const navigate = useNavigate();
    const { id: puestoId } = useParams();
    const [candidatos, setCandidatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [candidatoDetalle, setCandidatoDetalle] = useState(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await buscarCandidatos(puestoId);
                if (!res.ok) throw new Error("Error al buscar candidatos.");
                const data = await res.json();
                setCandidatos(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [puestoId]);

    const verDetalle = async (id) => {
        setCargandoDetalle(id);
        try {
            const res = await getDetalleCandidato(id);
            if (!res.ok) throw new Error("No se pudo cargar el detalle.");
            const data = await res.json();
            setCandidatoDetalle(data);
        } catch (e) {
            alert(e.message);
        } finally {
            setCargandoDetalle(null);
        }
    };

    if (loading) return <div className="page"><p className="msg-empty">Buscando candidatos...</p></div>;
    if (error)   return <div className="page"><p className="msg-error">{error}</p></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div className="flex-between">
                    <h1>Candidatos</h1>
                    <button
                        onClick={() => navigate("/empresa/puestos")}
                        style={{ padding: "8px 16px", background: "none", border: "1px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", color: "var(--color-text-secondary)", fontWeight: 600 }}
                    >
                        ← Volver a Puestos
                    </button>
                </div>
            </div>

            {candidatos.length === 0 ? (
                <div className="card">
                    <p className="msg-empty">No se encontraron candidatos que se hayan postulado a este puesto.</p>
                </div>
            ) : (
                <>
                    <p style={{ marginBottom: 16, color: "var(--color-text-secondary)", fontSize: 14 }}>
                        {candidatos.length} candidato{candidatos.length !== 1 ? "s" : ""} postulado{candidatos.length !== 1 ? "s" : ""}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {candidatos.map((c) => (
                            <div key={c.id} className="card">
                                <div className="flex-between">
                                    <div>
                                        <h3 style={{ fontSize: 16, marginBottom: 4 }}>{c.nombre} {c.primerApellido}</h3>
                                        <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 6 }}>{c.correo} · {c.lugarResidencia}</p>
                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                            {c.tieneCurriculo && <span className="badge badge-green">Con currículo</span>}
                                            {c.habilidades && c.habilidades.length > 0 && (
                                                <span className="badge badge-blue">{c.habilidades.length} habilidad{c.habilidades.length !== 1 ? "es" : ""}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => verDetalle(c.id)}
                                        disabled={cargandoDetalle === c.id}
                                        style={{ padding: "9px 18px", background: "var(--color-background-info)", color: "var(--color-text-info)", border: "1px solid var(--color-border-info)", borderRadius: "var(--border-radius-md)", cursor: cargandoDetalle === c.id ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", opacity: cargandoDetalle === c.id ? 0.7 : 1 }}
                                    >
                                        {cargandoDetalle === c.id ? "Cargando..." : "Ver detalle"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {candidatoDetalle && <ModalDetalle candidato={candidatoDetalle} onCerrar={() => setCandidatoDetalle(null)} />}
        </div>
    );
}