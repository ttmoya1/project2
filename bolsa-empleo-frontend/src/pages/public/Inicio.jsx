import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPuestosRecientes } from "../../api/api";

function TarjetaPuesto({ puesto }) {
    const [hover, setHover] = useState(false);
    const salario = puesto.salario ? `₡ ${Number(puesto.salario).toLocaleString("es-CR")}` : "—";

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: "var(--color-background-primary)",
                border: `0.5px solid ${hover ? "var(--color-border-info)" : "var(--color-border-tertiary)"}`,
                borderRadius: "var(--border-radius-lg)",
                padding: "1rem 1.25rem",
                cursor: "default",
                transition: "border-color 0.15s",
                position: "relative",
            }}
        >
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: "0 0 4px" }}>
                {puesto.empresaNombre}
            </p>
            <p style={{ fontSize: "15px", fontWeight: "500", margin: "0 0 8px", color: "var(--color-text-primary)" }}>
                {puesto.descripcion.length > 50 ? puesto.descripcion.slice(0, 50) + "…" : puesto.descripcion}
            </p>
            <p style={{ fontSize: "14px", color: "var(--color-text-info)", fontWeight: "500", margin: "0 0 10px" }}>
                {salario}
            </p>

            {hover && puesto.caracteristicas && puesto.caracteristicas.length > 0 && (
                <div style={{
                    position: "absolute", top: "0", left: "calc(100% + 8px)",
                    zIndex: 100, background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-secondary)",
                    borderRadius: "var(--border-radius-lg)",
                    padding: "1rem 1.25rem", width: "240px",
                }}>
                    <p style={{ fontSize: "13px", fontWeight: "500", margin: "0 0 8px", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Requisitos
                    </p>
                    <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                        {puesto.caracteristicas.map((c, i) => (
                            <li key={i} style={{ fontSize: "13px", color: "var(--color-text-primary)", padding: "2px 0", display: "flex", gap: "6px" }}>
                                <span style={{ color: "var(--color-text-secondary)" }}>•</span>
                                {c.caracteristicaNombre}
                                <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>(nivel {c.nivelRequerido})</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function Inicio() {
    const [puestos, setPuestos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        getPuestosRecientes()
            .then(r => r.json())
            .then(setPuestos)
            .finally(() => setCargando(false));
    }, []);

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "500", margin: "0 0 0.5rem" }}>Bolsa de Empleo</h1>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: "0 0 2rem" }}>
                Encuentra el puesto ideal o el candidato perfecto.
            </p>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
                <Link to="/buscar" style={{
                    padding: "8px 20px", borderRadius: "var(--border-radius-md)",
                    border: "0.5px solid var(--color-border-secondary)",
                    textDecoration: "none", fontSize: "14px", color: "var(--color-text-primary)",
                }}>
                    Buscar puestos
                </Link>
                <Link to="/registro/empresa" style={{
                    padding: "8px 20px", borderRadius: "var(--border-radius-md)",
                    border: "0.5px solid var(--color-border-secondary)",
                    textDecoration: "none", fontSize: "14px", color: "var(--color-text-primary)",
                }}>
                    Registrar empresa
                </Link>
                <Link to="/registro/oferente" style={{
                    padding: "8px 20px", borderRadius: "var(--border-radius-md)",
                    border: "0.5px solid var(--color-border-secondary)",
                    textDecoration: "none", fontSize: "14px", color: "var(--color-text-primary)",
                }}>
                    Registrar oferente
                </Link>
            </div>

            <h2 style={{ fontSize: "16px", fontWeight: "500", margin: "0 0 1rem" }}>
                Puestos recientes
            </h2>

            {cargando ? (
                <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>Cargando…</p>
            ) : puestos.length === 0 ? (
                <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>No hay puestos publicados aún.</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                    {puestos.map(p => <TarjetaPuesto key={p.id} puesto={p} />)}
                </div>
            )}
        </div>
    );
}