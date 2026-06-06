import { useNavigate } from "react-router-dom";

export default function DashboardAdmin() {

    const navigate = useNavigate();

    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "2rem auto",
                padding: "0 1.5rem"
            }}
        >
            <h1
                style={{
                    marginBottom: "2rem",
                    fontSize: "28px",
                    fontWeight: "600"
                }}
            >
                Panel de Administración
            </h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "1.5rem"
                }}
            >
                {/* Empresas */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "1.5rem",
                        background: "#fff"
                    }}
                >
                    <h2>Empresas Pendientes</h2>

                    <p style={{ color: "#666" }}>
                        Aprobar o rechazar nuevas empresas registradas.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/admin/empresas")}
                    >
                        Ver Empresas
                    </button>
                </div>

                {/* Oferentes */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "1.5rem",
                        background: "#fff"
                    }}
                >
                    <h2>Oferentes Pendientes</h2>

                    <p style={{ color: "#666" }}>
                        Revisar y aprobar oferentes registrados.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/admin/oferentes")}
                    >
                        Ver Oferentes
                    </button>
                </div>

                {/* Características */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "1.5rem",
                        background: "#fff"
                    }}
                >
                    <h2>Características</h2>

                    <p style={{ color: "#666" }}>
                        Gestionar categorías y habilidades del sistema.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/admin/caracteristicas")}
                    >
                        Administrar
                    </button>
                </div>
            </div>

            <div
                style={{
                    marginTop: "2rem",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "1.5rem",
                    background: "#fff"
                }}
            >
                <h2>Resumen General</h2>

                <div
                    style={{
                        display: "flex",
                        gap: "2rem",
                        flexWrap: "wrap",
                        marginTop: "1rem"
                    }}
                >
                    <div>
                        <strong>Empresas Pendientes:</strong> 0
                    </div>

                    <div>
                        <strong>Oferentes Pendientes:</strong> 0
                    </div>

                    <div>
                        <strong>Características:</strong> 0
                    </div>
                </div>
            </div>
        </div>
    );
}