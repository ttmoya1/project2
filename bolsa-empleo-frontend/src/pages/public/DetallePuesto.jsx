import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function DetallePuesto() {

    const { id } = useParams();

    const [puesto, setPuesto] = useState(null);

    useEffect(() => {

        fetch(
            `http://localhost:8080/api/public/puestos/${id}`
        )
            .then(r => r.json())
            .then(setPuesto)
            .catch(console.error);

    }, [id]);

    const aplicar = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:8080/api/oferente/postular/${id}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error();
            }

            alert("Aplicación enviada correctamente");

        } catch (error) {

            console.error(error);

            alert("No fue posible aplicar al puesto");
        }
    };

    if (!puesto) {
        return (
            <div style={{ padding: "2rem" }}>
                Cargando...
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: "1000px",
                margin: "2rem auto",
                padding: "0 1rem"
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "2rem",
                    boxShadow: "0 2px 10px rgba(0,0,0,.1)"
                }}
            >
                <h1>{puesto.empresaNombre}</h1>

                <h2>{puesto.descripcion}</h2>

                <p>
                    <strong>Salario:</strong>{" "}
                    ₡ {Number(puesto.salario).toLocaleString("es-CR")}
                </p>

                <hr />

                <h3>Requisitos del puesto</h3>

                {puesto.caracteristicas?.map((c, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: "15px",
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "8px"
                        }}
                    >
                        <div>
                            <strong>
                                {c.caracteristicaNombre}
                            </strong>
                        </div>

                        <div>
                            Nivel requerido:
                            {" "}
                            {c.nivelRequerido}
                        </div>
                    </div>
                ))}

                <button
                    onClick={aplicar}
                    style={{
                        marginTop: "20px",
                        padding: "12px 20px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#2563eb",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >
                    Aplicar al puesto
                </button>
            </div>
        </div>
    );
}