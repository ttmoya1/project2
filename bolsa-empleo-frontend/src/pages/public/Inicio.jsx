import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPuestosRecientes } from "../../api/api";

function TarjetaPuesto({ puesto }) {
    const [hover, setHover] = useState(false);
    const salario = puesto.salario
        ? `₡ ${Number(puesto.salario).toLocaleString("es-CR")}`
        : "—";

    return (
        <div
            className="tarjeta-puesto"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* Contenido principal de la tarjeta */}
            <p className="tarjeta-empresa">{puesto.empresaNombre}</p>
            <p className="tarjeta-titulo">
                {puesto.descripcion?.length > 50
                    ? puesto.descripcion.slice(0, 50) + "…"
                    : puesto.descripcion}
            </p>
            <p className="tarjeta-salario">{salario}</p>
            <button className="tarjeta-btn" tabIndex={-1}>Ver detalle</button>

            {/* Tooltip de requisitos al hacer hover */}
            {hover && puesto.caracteristicas && puesto.caracteristicas.length > 0 && (
                <div className="tarjeta-tooltip">
                    <p className="tooltip-titulo">Requisitos</p>
                    <ul className="tooltip-lista">
                        {puesto.caracteristicas.map((c, i) => (
                            <li key={i}>
                                <span>•</span>
                                {c.rutaNombre
                                    ? `/ ${c.rutaNombre} / ${c.caracteristicaNombre}`
                                    : c.caracteristicaNombre}
                                {c.nivelRequerido !== undefined && (
                                    <span className="tooltip-nivel">({c.nivelRequerido})</span>
                                )}
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
            .catch(() => setPuestos([]))
            .finally(() => setCargando(false));
    }, []);

    return (
        <div className="inicio-wrapper">
            <main className="page">
                <h1 className="inicio-titulo">Bolsa de Empleo</h1>

                {cargando ? (
                    <p className="msg-empty">Cargando…</p>
                ) : puestos.length === 0 ? (
                    <p className="msg-empty">No hay puestos publicados aún.</p>
                ) : (
                    <div className="cards-grid">
                        {puestos.map(p => (
                            <TarjetaPuesto key={p.id} puesto={p} />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer igual al PDF */}
            <footer className="site-footer">
                <div className="footer-inner">
                    <div className="footer-left">
                        <strong>Bolsa de Empleo</strong>
                        <span>Total Soft Inc.</span>
                    </div>
                    <div className="footer-right">
                        <span>Contacto: info@bolsaempleo.local</span>
                        <span>Créditos: Equipo de desarrollo</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
