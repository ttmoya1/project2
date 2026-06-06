import { useEffect, useState } from "react";
import { getPuestosRecientes } from "../../api/api";
import {Link} from "react-router-dom";


function TarjetaPuesto({ puesto, aplicar }) {
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
            <p className="tarjeta-empresa">
                {puesto.empresaNombre}
            </p>

            <p className="tarjeta-titulo">
                {puesto.descripcion?.length > 50
                    ? puesto.descripcion.slice(0, 50) + "…"
                    : puesto.descripcion}
            </p>

            <p className="tarjeta-salario">
                {salario}
            </p>

            <Link
                to={`/puesto/${puesto.id}`}
                className="tarjeta-btn"
            >
                Ver detalles
            </Link>

            {hover &&
                puesto.caracteristicas &&
                puesto.caracteristicas.length > 0 && (
                    <div className="tarjeta-tooltip">
                        <p className="tooltip-titulo">
                            Requisitos
                        </p>

                        <ul className="tooltip-lista">
                            {puesto.caracteristicas.map((c, i) => (
                                <li key={i}>
                                    <span>• </span>

                                    {c.rutaNombre
                                        ? `/ ${c.rutaNombre} / ${c.caracteristicaNombre}`
                                        : c.caracteristicaNombre}

                                    {c.nivelRequerido !== undefined && (
                                        <span className="tooltip-nivel">
                                            {" "}
                                            ({c.nivelRequerido})
                                        </span>
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
            .then((r) => r.json())
            .then(setPuestos)
            .catch(() => setPuestos([]))
            .finally(() => setCargando(false));
    }, []);

    const aplicar = async (puestoId) => {
        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:8080/api/oferente/postular/${puestoId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Error al aplicar");
            }

            alert("Aplicación enviada correctamente");

        } catch (error) {
            console.error(error);
            alert("No fue posible aplicar al puesto");
        }
    };

    return (
        <div className="inicio-wrapper">
            <main className="page">
                <h1 className="inicio-titulo">
                    Bolsa de Empleo
                </h1>

                {cargando ? (
                    <p className="msg-empty">
                        Cargando…
                    </p>
                ) : puestos.length === 0 ? (
                    <p className="msg-empty">
                        No hay puestos publicados aún.
                    </p>
                ) : (
                    <div className="cards-grid">
                        {puestos.map((p) => (
                            <TarjetaPuesto
                                key={p.id}
                                puesto={p}
                                aplicar={aplicar}
                            />
                        ))}
                    </div>
                )}
            </main>

            <footer className="site-footer">
                <div className="footer-inner">
                    <div className="footer-left">
                        <strong>Bolsa de Empleo</strong>
                        <span>Total Soft Inc.</span>
                    </div>

                    <div className="footer-right">
                        <span>
                            Contacto: info@bolsaempleo.local
                        </span>

                        <span>
                            Créditos: Equipo de desarrollo
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}