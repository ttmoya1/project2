import { useEffect, useState } from "react";

export default function AprobarOferentes() {

    const [oferentes, setOferentes] = useState([]);

    useEffect(() => {
        cargarOferentes();
    }, []);

    const cargarOferentes = async () => {
        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:8080/api/admin/oferentes",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();
            setOferentes(data);

        } catch (error) {
            console.error(error);
        }
    };

    const aprobarOferente = async (id) => {
        try {

            const token = localStorage.getItem("token");

            await fetch(
                `http://localhost:8080/api/admin/oferentes/${id}/aprobar`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            cargarOferentes();

        } catch (error) {
            console.error(error);
        }
    };

    const rechazarOferente = async (id) => {
        try {

            const token = localStorage.getItem("token");

            await fetch(
                `http://localhost:8080/api/admin/oferentes/${id}/rechazar`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            cargarOferentes();

        } catch (error) {
            console.error(error);
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
                Oferentes Pendientes
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
                        <th style={{ padding: "12px" }}>Nombre</th>
                        <th style={{ padding: "12px" }}>Identificación</th>
                        <th style={{ padding: "12px" }}>Teléfono</th>
                        <th style={{ padding: "12px" }}>Nacionalidad</th>
                        <th style={{ padding: "12px" }}>Estado</th>
                        <th style={{ padding: "12px" }}>Acciones</th>
                    </tr>
                    </thead>

                    <tbody>
                    {oferentes.map((oferente) => (
                        <tr key={oferente.id}>
                            <td style={{ padding: "12px" }}>
                                {oferente.nombre} {oferente.primerApellido}
                            </td>

                            <td style={{ padding: "12px" }}>
                                {oferente.identificacion}
                            </td>

                            <td style={{ padding: "12px" }}>
                                {oferente.telefono}
                            </td>

                            <td style={{ padding: "12px" }}>
                                {oferente.nacionalidad}
                            </td>

                            <td style={{ padding: "12px" }}>
                                {oferente.aprobado
                                    ? "✅ Aprobado"
                                    : "⏳ Pendiente"}
                            </td>

                            <td style={{ padding: "12px" }}>
                                {!oferente.aprobado && (
                                    <>
                                        <button
                                            onClick={() =>
                                                aprobarOferente(oferente.id)
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
                                                rechazarOferente(oferente.id)
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

                {oferentes.length === 0 && (
                    <div
                        style={{
                            padding: "20px",
                            textAlign: "center"
                        }}
                    >
                        No hay oferentes pendientes.
                    </div>
                )}
            </div>
        </div>
    );
}