import { useEffect, useState } from "react";

export default function GestionCaracteristicas() {

    const [caracteristicas, setCaracteristicas] = useState([]);
    const [nombre, setNombre] = useState("");
    const [padreId, setPadreId] = useState("");

    useEffect(() => {
        cargarCaracteristicas();
    }, []);

    const cargarCaracteristicas = async () => {
        try {

            const response = await fetch(
                "http://localhost:8080/api/public/caracteristicas"
            );

            const data = await response.json();
            setCaracteristicas(data);

        } catch (error) {
            console.error(error);
        }
    };

    const guardarCaracteristica = async () => {
        try {

            if (!nombre.trim()) {
                alert("Debe ingresar un nombre");
                return;
            }

            await fetch(
                "http://localhost:8080/api/public/caracteristicas",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        nombre,
                        padreId
                    })
                }
            );

            setNombre("");
            setPadreId("");

            cargarCaracteristicas();

        } catch (error) {
            console.error(error);
            alert("Error al guardar la característica");
        }
    };

    const renderNodo = (nodo, nivel = 0) => (
        <div key={nodo.id}>
            <div
                style={{
                    padding: "14px 18px",
                    paddingLeft: `${nivel * 35 + 18}px`,
                    borderBottom: "1px solid #ececec",
                    backgroundColor:
                        nivel === 0 ? "#f8f9fa" : "#ffffff",
                    fontWeight:
                        nivel === 0 ? "600" : "400",
                    color: "#222"
                }}
            >
                {nivel === 0 ? "📂" : "📄"} {nodo.nombre}
            </div>

            {nodo.hijos &&
                nodo.hijos.map((hijo) =>
                    renderNodo(hijo, nivel + 1)
                )}
        </div>
    );

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
                    marginBottom: "20px",
                    fontSize: "30px",
                    fontWeight: "700",
                    color: "#222"
                }}
            >
                Gestión de Características
            </h1>

            <div
                style={{
                    background: "#ffffff",
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "25px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}
            >
                <h3
                    style={{
                        marginBottom: "15px",
                        color: "#222"
                    }}
                >
                    Nueva Característica
                </h3>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap"
                    }}
                >
                    <input
                        type="text"
                        placeholder="Nombre de la característica"
                        value={nombre}
                        onChange={(e) =>
                            setNombre(e.target.value)
                        }
                        style={{
                            flex: 1,
                            minWidth: "250px",
                            padding: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            backgroundColor: "#fff",
                            color: "#000",
                            fontSize: "14px",
                            outline: "none"
                        }}
                    />

                    <select
                        value={padreId}
                        onChange={(e) =>
                            setPadreId(e.target.value)
                        }
                        style={{
                            minWidth: "250px",
                            padding: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            backgroundColor: "#fff",
                            color: "#000",
                            fontSize: "14px"
                        }}
                    >
                        <option value="">
                            Crear padre
                        </option>

                        {caracteristicas.map((c) => (
                            <option
                                key={c.id}
                                value={c.id}
                            >
                                {c.nombre}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={guardarCaracteristica}
                        style={{
                            padding: "12px 20px",
                            backgroundColor: "#0d6efd",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >
                        Agregar
                    </button>
                </div>
            </div>

            <div
                style={{
                    background: "#ffffff",
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}
            >
                <div
                    style={{
                        padding: "15px 20px",
                        backgroundColor: "#0d6efd",
                        color: "#fff",
                        fontWeight: "600"
                    }}
                >
                    Árbol de Características
                </div>

                {caracteristicas.length > 0 ? (
                    caracteristicas.map((c) =>
                        renderNodo(c)
                    )
                ) : (
                    <div
                        style={{
                            padding: "25px",
                            textAlign: "center",
                            color: "#666"
                        }}
                    >
                        No hay características registradas.
                    </div>
                )}
            </div>
        </div>
    );
}