import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardEmpresa, getMisPuestos } from "../../api/api";

export default function DashboardEmpresa() {
    const navigate = useNavigate();
    const [empresa, setEmpresa] = useState(null);
    const [puestos, setPuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargar = async () => {
            try {
                const [resEmpresa, resPuestos] = await Promise.all([
                    getDashboardEmpresa(),
                    getMisPuestos(),
                ]);
                if (!resEmpresa.ok) throw new Error("Error al cargar datos de empresa");
                if (!resPuestos.ok) throw new Error("Error al cargar puestos");
                const dataEmpresa = await resEmpresa.json();
                const dataPuestos = await resPuestos.json();
                setEmpresa(dataEmpresa);
                setPuestos(dataPuestos);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const puestosActivos = puestos.filter((p) => p.activo).length;
    const puestosInactivos = puestos.filter((p) => !p.activo).length;

    if (loading) return <div className="page"><p className="msg-empty">Cargando...</p></div>;
    if (error) return <div className="page"><p className="msg-error">{error}</p></div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>Panel de Empresa</h1>
                {empresa && <p style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>{empresa.nombre}</p>}
            </div>

            {empresa && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <h2 style={{ marginBottom: 16, fontSize: 18 }}>Información de la Empresa</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                        <div>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 2 }}>Nombre</p>
                            <p style={{ fontWeight: 600 }}>{empresa.nombre}</p>
                        </div>
                        <div>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 2 }}>Correo</p>
                            <p style={{ fontWeight: 600 }}>{empresa.correo}</p>
                        </div>
                        <div>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 2 }}>Teléfono</p>
                            <p style={{ fontWeight: 600 }}>{empresa.telefono}</p>
                        </div>
                        <div>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 2 }}>Localización</p>
                            <p style={{ fontWeight: 600 }}>{empresa.localizacion || empresa.ubicacion || "—"}</p>
                        </div>
                    </div>
                    {empresa.descripcion && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--color-border-tertiary)" }}>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 4 }}>Descripción</p>
                            <p>{empresa.descripcion}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="cards-grid" style={{ marginBottom: 24 }}>
                <div className="card" style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 36, fontWeight: 700, color: "var(--color-primary)" }}>{puestos.length}</p>
                    <p style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>Puestos totales</p>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 36, fontWeight: 700, color: "var(--color-text-success)" }}>{puestosActivos}</p>
                    <p style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>Puestos activos</p>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 36, fontWeight: 700, color: "var(--color-text-secondary)" }}>{puestosInactivos}</p>
                    <p style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>Puestos inactivos</p>
                </div>
            </div>

            <div className="card">
                <h2 style={{ marginBottom: 16, fontSize: 18 }}>Accesos Rápidos</h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button
                        onClick={() => navigate("/empresa/puestos")}
                        style={{
                            padding: "10px 20px",
                            background: "var(--color-primary)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "var(--border-radius-md)",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Ver Mis Puestos
                    </button>
                    <button
                        onClick={() => navigate("/empresa/puestos/nuevo")}
                        style={{
                            padding: "10px 20px",
                            background: "var(--color-background-success)",
                            color: "var(--color-text-success)",
                            border: "1px solid var(--color-text-success)",
                            borderRadius: "var(--border-radius-md)",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Publicar Nuevo Puesto
                    </button>
                </div>
            </div>

            {puestos.length > 0 && (
                <div className="card" style={{ marginTop: 24 }}>
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h2 style={{ fontSize: 18 }}>Puestos Recientes</h2>
                        <button
                            onClick={() => navigate("/empresa/puestos")}
                            style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
                        >
                            Ver todos →
                        </button>
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Salario</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        {puestos.slice(0, 5).map((p) => (
                            <tr key={p.id}>
                                <td>{p.descripcion}</td>
                                <td>₡{p.salario?.toLocaleString()}</td>
                                <td>
                    <span className={`badge ${p.tipo === "PUBLICO" ? "badge-blue" : "badge-gray"}`}>
                      {p.tipo === "PUBLICO" ? "Público" : "Privado"}
                    </span>
                                </td>
                                <td>
                    <span className={`badge ${p.activo ? "badge-green" : "badge-red"}`}>
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
