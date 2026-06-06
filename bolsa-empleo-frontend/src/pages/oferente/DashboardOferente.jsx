import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardOferente } from "../../api/api";
import { nivelLabel } from "../../utils/nivelUtils";

export default function DashboardOferente() {
    const [oferente, setOferente] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getDashboardOferente()
            .then(r => {
                if (!r.ok) throw new Error("Error al cargar datos");
                return r.json();
            })
            .then(setOferente)
            .catch(() => setError("No se pudieron cargar los datos del perfil."))
            .finally(() => setCargando(false));
    }, []);

    if (cargando) return <div className="page"><p className="msg-empty">Cargando...</p></div>;
    if (error)    return <div className="page"><p className="msg-error">{error}</p></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Mi Panel</h1>
                    <p style={{ marginTop: "2px" }}>
                        Bienvenido,{" "}
                        <strong style={{ color: "var(--color-text-primary)" }}>
                            {oferente.nombre} {oferente.primerApellido}
                        </strong>
                    </p>
                </div>
            </div>

            {/* Accesos rápidos */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1rem",
                marginBottom: "1.5rem",
            }}>
                <AccionCard
                    titulo="Mis Habilidades"
                    descripcion="Registrá y actualizá tus destrezas y niveles."
                    link="/oferente/habilidades"
                    icono={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                    }
                />
                <AccionCard
                    titulo="Mi Currículo"
                    descripcion="Subí tu CV en formato PDF."
                    link="/oferente/curriculo"
                    icono={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                    }
                />
            </div>

            {/* Datos del perfil */}
            <div className="card" style={{ marginBottom: "1rem" }}>
                <h2 style={{ marginBottom: "1.25rem" }}>Datos del perfil</h2>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                    gap: "1rem",
                }}>
                    <Campo label="Identificación"     valor={oferente.identificacion} />
                    <Campo label="Nombre"              valor={oferente.nombre} />
                    <Campo label="Primer apellido"     valor={oferente.primerApellido} />
                    <Campo label="Nacionalidad"        valor={oferente.nacionalidad} />
                    <Campo label="Teléfono"            valor={oferente.telefono} />
                    <Campo label="Lugar de residencia" valor={oferente.lugarResidencia} />
                    <Campo label="Correo"              valor={oferente.correo} />
                </div>
            </div>

            {/* Tabla de habilidades */}
            <div className="card">
                <div className="flex-between" style={{ marginBottom: "1rem" }}>
                    <h2>Mis habilidades</h2>
                    <Link to="/oferente/habilidades" style={{ fontSize: "13px" }}>
                        {oferente.habilidades?.length > 0 ? "Editar" : "Agregar"}
                    </Link>
                </div>

                {!oferente.habilidades || oferente.habilidades.length === 0 ? (
                    <p className="msg-empty" style={{ padding: "1.5rem" }}>
                        No tenés habilidades registradas aún.{" "}
                        <Link to="/oferente/habilidades">Agregalas acá</Link>
                    </p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Habilidad</th>
                            <th style={{ width: "130px" }}>Nivel</th>
                        </tr>
                        </thead>
                        <tbody>
                        {oferente.habilidades.map((h, i) => (
                            <tr key={i}>
                                <td>{h.caracteristicaNombre}</td>
                                <td><NivelBadge nivel={h.nivel} /></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function AccionCard({ titulo, descripcion, link, icono }) {
    return (
        <Link to={link} style={{ textDecoration: "none" }}>
            <div className="card" style={{ cursor: "pointer", height: "100%" }}>
                <div style={{
                    width: "36px", height: "36px",
                    borderRadius: "var(--border-radius-md)",
                    background: "var(--color-background-info)",
                    color: "var(--color-text-info)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "12px",
                }}>
                    {icono}
                </div>
                <h3 style={{ marginBottom: "4px" }}>{titulo}</h3>
                <p style={{ fontSize: "13px" }}>{descripcion}</p>
            </div>
        </Link>
    );
}

function Campo({ label, valor }) {
    return (
        <div>
            <p style={{
                fontSize: "11px", fontWeight: "500",
                color: "var(--color-text-secondary)",
                textTransform: "uppercase", letterSpacing: "0.05em",
                marginBottom: "2px",
            }}>
                {label}
            </p>
            <p style={{ fontSize: "14px", color: "var(--color-text-primary)" }}>
                {valor || "—"}
            </p>
        </div>
    );
}

function NivelBadge({ nivel }) {
    const n = Number(nivel);
    const color = n >= 4 ? "badge-green" : n >= 2 ? "badge-blue" : "badge-gray";
    return <span className={`badge ${color}`}>{nivelLabel(nivel)}</span>;
}