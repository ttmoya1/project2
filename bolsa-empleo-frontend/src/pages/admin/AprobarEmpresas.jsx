import { useEffect, useState } from "react";

export default function AprobarEmpresas() {

    const [empresas, setEmpresas] = useState([]);

    const cargarEmpresas = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:8080/api/admin/empresas",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();
            setEmpresas(data);

        } catch (error) {
            console.error("Error cargando empresas:", error);
        }
    };

    useEffect(() => {
        cargarEmpresas();
    }, []);

    const aprobarEmpresa = async (id) => {
        try {
            const token = localStorage.getItem("token");

            await fetch(
                `http://localhost:8080/api/admin/empresas/${id}/aprobar`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            cargarEmpresas();

        } catch (error) {
            console.error("Error aprobando empresa:", error);
        }
    };

    const rechazarEmpresa = async (id) => {
        try {
            const token = localStorage.getItem("token");

            await fetch(
                `http://localhost:8080/api/admin/empresas/${id}/rechazar`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            cargarEmpresas();

        } catch (error) {
            console.error("Error rechazando empresa:", error);
        }
    };

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
                    marginBottom: "1.5rem",
                    fontSize: "28px",
                    fontWeight: "600"
                }}
            >
                Empresas Registradas
            </h1>

            <div
                style={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    overflow: "hidden"
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >
                    <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                        <th style={{ padding: "12px", textAlign: "left" }}>
                            Nombre
                        </th>

                        <th style={{ padding: "12px", textAlign: "left" }}>
                            Teléfono
                        </th>

                        <th style={{ padding: "12px", textAlign: "left" }}>
                            Ubicación
                        </th>

                        <th style={{ padding: "12px", textAlign: "left" }}>
                            Estado
                        </th>

                        <th style={{ padding: "12px", textAlign: "left" }}>
                            Acciones
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {empresas.map((empresa) => (
                        <tr
                            key={empresa.id}
                            style={{
                                borderTop: "1px solid #eee"
                            }}
                        >
                            <td style={{ padding: "12px" }}>
                                {empresa.nombre}
                            </td>

                            <td style={{ padding: "12px" }}>
                                {empresa.telefono || "-"}
                            </td>

                            <td style={{ padding: "12px" }}>
                                {empresa.localizacion || "-"}
                            </td>

                            <td style={{ padding: "12px" }}>
                                {empresa.aprobada
                                    ? "✅ Aprobada"
                                    : "⏳ Pendiente"}
                            </td>

                            <td style={{ padding: "12px" }}>
                                {!empresa.aprobada && (
                                    <>
                                        <button
                                            onClick={() =>
                                                aprobarEmpresa(empresa.id)
                                            }
                                            style={{
                                                padding: "8px 12px",
                                                marginRight: "8px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Aprobar
                                        </button>

                                        <button
                                            onClick={() =>
                                                rechazarEmpresa(empresa.id)
                                            }
                                            style={{
                                                padding: "8px 12px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Rechazar
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {empresas.length === 0 && (
                    <div
                        style={{
                            padding: "20px",
                            textAlign: "center"
                        }}
                    >
                        No hay empresas registradas.
                    </div>
                )}
            </div>
        </div>
    );
}