import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginApi } from "../../api/api";
import { nivelLabel } from "../../utils/nivelUtils";

function ModalLogin({ onLogin, onCerrar }) {
    const [correo, setCorreo] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setCargando(true);
        try {
            const res = await loginApi(correo, clave);
            if (!res.ok) throw new Error("Credenciales incorrectas");
            const data = await res.json();
            if (data.rol !== "OFERENTE") {
                setError("Solo oferentes pueden aplicar a puestos.");
                return;
            }
            login(data);
            onLogin();
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1.75rem 1.5rem", width: "300px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "1rem" }}>Iniciá sesión para aplicar</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: "500" }}>Correo</label>
                        <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: "500" }}>Clave</label>
                        <input type="password" value={clave} onChange={e => setClave(e.target.value)} required />
                    </div>
                    {error && <p style={{ fontSize: "12px", color: "var(--color-text-danger)", margin: 0 }}>{error}</p>}
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <button type="button" onClick={onCerrar} style={{ flex: 1 }}>Cancelar</button>
                        <button type="submit" disabled={cargando} style={{ flex: 1, background: "var(--color-primary)", color: "#fff", border: "none", fontWeight: "500" }}>
                            {cargando ? "Ingresando..." : "Ingresar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function DetallePuesto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [puesto, setPuesto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [aplicando, setAplicando] = useState(false);
    const [msg, setMsg] = useState({ tipo: "", texto: "" });
    const [mostrarLogin, setMostrarLogin] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8080/api/public/puestos/${id}`)
            .then(r => { if (!r.ok) throw new Error("Puesto no encontrado"); return r.json(); })
            .then(setPuesto)
            .catch(() => setMsg({ tipo: "error", texto: "No se pudo cargar el puesto." }))
            .finally(() => setCargando(false));
    }, [id]);

    const doAplicar = async (token) => {
        setAplicando(true);
        setMsg({ tipo: "", texto: "" });
        try {
            const res = await fetch(`http://localhost:8080/api/oferente/postular/${id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const texto = await res.text();
            if (!res.ok) {
                if (texto.includes("Ya aplicó")) {
                    setMsg({ tipo: "info", texto: "Ya habías aplicado a este puesto anteriormente." });
                } else {
                    throw new Error(texto || "Error al postular");
                }
                return;
            }
            setMsg({ tipo: "success", texto: "¡Postulación enviada correctamente!" });
        } catch (err) {
            setMsg({ tipo: "error", texto: err.message || "No se pudo enviar la postulación." });
        } finally {
            setAplicando(false);
        }
    };

    const aplicar = () => {
        if (!auth) { setMostrarLogin(true); return; }
        if (auth.rol !== "OFERENTE") {
            setMsg({ tipo: "info", texto: "Solo los oferentes pueden aplicar a puestos." });
            return;
        }
        doAplicar(auth.token);
    };

    const handleLoginExitoso = () => {
        setMostrarLogin(false);
        const token = localStorage.getItem("token");
        doAplicar(token);
    };

    if (cargando) return <div className="page"><p className="msg-empty">Cargando...</p></div>;

    if (!puesto) return (
        <div className="page">
            <p className="msg-error">{msg.texto}</p>
            <button onClick={() => navigate(-1)} style={{ marginTop: "1rem" }}>← Volver</button>
        </div>
    );

    return (
        <div className="page" style={{ maxWidth: "720px" }}>
            {mostrarLogin && (
                <ModalLogin onLogin={handleLoginExitoso} onCerrar={() => setMostrarLogin(false)} />
            )}

            <button onClick={() => navigate(-1)} style={{ marginBottom: "1.5rem", background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: "14px", padding: 0 }}>
                ← Volver
            </button>

            <div className="card" style={{ marginBottom: "1rem" }}>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>{puesto.empresaNombre}</p>
                <h1 style={{ fontSize: "20px", marginBottom: "8px" }}>{puesto.descripcion}</h1>
                <p style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-text-info)", marginBottom: "12px" }}>
                    ₡ {Number(puesto.salario).toLocaleString("es-CR")}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                    <span className={`badge ${puesto.tipo === "PUBLICO" ? "badge-blue" : "badge-gray"}`}>
                        {puesto.tipo === "PUBLICO" ? "Público" : "Privado"}
                    </span>
                </div>
            </div>

            {puesto.caracteristicas && puesto.caracteristicas.length > 0 && (
                <div className="card" style={{ marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "16px", marginBottom: "1rem" }}>Requisitos del puesto</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {puesto.caracteristicas.map((c, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
                                <span style={{ fontSize: "14px", fontWeight: "500" }}>{c.caracteristicaNombre}</span>
                                <span className="badge badge-blue">
                                    {nivelLabel(c.nivelRequerido)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
                {msg.tipo !== "success" && (
                    <button
                        onClick={aplicar}
                        disabled={aplicando}
                        style={{ padding: "12px 28px", background: aplicando ? "var(--color-text-secondary)" : "var(--color-primary)", color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", cursor: aplicando ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "15px" }}
                    >
                        {aplicando ? "Enviando..." : "Aplicar al puesto"}
                    </button>
                )}

                {msg.texto && (
                    <p className={msg.tipo === "error" ? "msg-error" : msg.tipo === "success" ? "msg-success" : "msg-empty"} style={{ margin: 0 }}>
                        {msg.texto}
                    </p>
                )}
            </div>
        </div>
    );
}