import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginApi } from "../api/api";
import { useState } from "react";

export default function Navbar() {
    const { auth, login, logout } = useAuth();
    const navigate = useNavigate();
    const [mostrarLogin, setMostrarLogin] = useState(false);
    const [correo, setCorreo] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await loginApi(correo, clave);
            if (!res.ok) throw new Error("Credenciales incorrectas");
            const data = await res.json();
            login(data);
            setMostrarLogin(false);
            setCorreo(""); setClave("");
            if (data.rol === "EMPRESA") navigate("/empresa/dashboard");
            else if (data.rol === "OFERENTE") navigate("/oferente/dashboard");
            else if (data.rol === "ADMINISTRADOR") navigate("/admin/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const linkStyle = {
        textDecoration: "none",
        fontSize: "14px",
        color: "var(--color-text-primary)",
        padding: "4px 8px",
        borderRadius: "var(--border-radius-md)",
    };

    return (
        <>
            <nav style={{
                borderBottom: "0.5px solid var(--color-border-tertiary)",
                background: "var(--color-background-primary)",
                padding: "0 2rem",
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                height: "52px",
                position: "sticky",
                top: 0,
                zIndex: 50,
            }}>
                <Link to="/" style={{ ...linkStyle, fontWeight: "500", fontSize: "16px" }}>
                    Bolsa de Empleo
                </Link>
                <Link to="/buscar" style={linkStyle}>Buscar</Link>

                {!auth && (
                    <>
                        <Link to="/registro/empresa" style={linkStyle}>Empresa</Link>
                        <Link to="/registro/oferente" style={linkStyle}>Oferente</Link>
                    </>
                )}

                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                    {auth ? (
                        <>
                            <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                                {auth.correo}
                            </span>
                            {auth.rol === "EMPRESA" && <Link to="/empresa/dashboard" style={linkStyle}>Mi panel</Link>}
                            {auth.rol === "OFERENTE" && <Link to="/oferente/dashboard" style={linkStyle}>Mi panel</Link>}
                            {auth.rol === "ADMINISTRADOR" && <Link to="/admin/dashboard" style={linkStyle}>Admin</Link>}
                            <button onClick={handleLogout} style={{ fontSize: "14px", cursor: "pointer" }}>
                                Salir
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setMostrarLogin(true)} style={{ fontSize: "14px", cursor: "pointer" }}>
                            Login
                        </button>
                    )}
                </div>
            </nav>

            {/* Modal de login */}
            {mostrarLogin && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
                    zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <div style={{
                        background: "var(--color-background-primary)",
                        border: "0.5px solid var(--color-border-secondary)",
                        borderRadius: "var(--border-radius-lg)",
                        padding: "1.5rem", width: "320px",
                    }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 1rem" }}>Login</h2>
                        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <label style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Usuario</label>
                                <input
                                    type="email" value={correo} onChange={e => setCorreo(e.target.value)}
                                    required style={{ width: "100%", marginTop: "4px", boxSizing: "border-box" }}
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Clave</label>
                                <input
                                    type="password" value={clave} onChange={e => setClave(e.target.value)}
                                    required style={{ width: "100%", marginTop: "4px", boxSizing: "border-box" }}
                                />
                            </div>
                            {error && <p style={{ fontSize: "13px", color: "var(--color-text-danger)", margin: 0 }}>{error}</p>}
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button type="button" onClick={() => { setMostrarLogin(false); setError(""); }}>
                                    Cancelar
                                </button>
                                <button type="submit">Ingresar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}