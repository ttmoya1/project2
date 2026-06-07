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
            if (!res.ok) {
                let mensaje = "Credenciales incorrectas.";
                try {
                    const body = await res.json();
                    if (body.message?.toLowerCase().includes("pendiente")) {
                        mensaje = "Su cuenta está pendiente de aprobación por un administrador.";
                    } else if (body.message?.toLowerCase().includes("no encontrado")) {
                        mensaje = "Correo no registrado.";
                    } else if (body.message?.toLowerCase().includes("contraseña")) {
                        mensaje = "Contraseña incorrecta.";
                    }
                } catch (_) {}
                throw new Error(mensaje);
            }
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

    const handleLogout = () => { logout(); navigate("/"); };

    return (
        <>
            <nav style={{
                borderBottom: "0.5px solid var(--color-border-tertiary)",
                background: "var(--color-background-primary)",
                padding: "0 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                height: "52px",
                position: "sticky",
                top: 0,
                zIndex: 100,
            }}>
                {/* Logo */}
                <Link to="/" style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    textDecoration: "none", marginRight: "8px",
                }}>
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: "var(--color-background-info)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="var(--color-text-info)" strokeWidth="2"
                             strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2"/>
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                        </svg>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-text-primary)" }}>
                        BolsaEmpleo
                    </span>
                </Link>

                {/* Links */}
                <NavLink to="/buscar">Buscar</NavLink>
                {!auth && <>
                    <NavLink to="/registro/empresa">Empresa</NavLink>
                    <NavLink to="/registro/oferente">Oferente</NavLink>
                </>}

                {/* Espaciador */}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                    {auth ? (
                        <>
                            <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                                {auth.correo}
                            </span>
                            {auth.rol === "EMPRESA"        && <NavLink to="/empresa/dashboard">Mi panel</NavLink>}
                            {auth.rol === "OFERENTE"       && <NavLink to="/oferente/dashboard">Mi panel</NavLink>}
                            {auth.rol === "ADMINISTRADOR"  && <NavLink to="/admin/dashboard">Admin</NavLink>}
                            <button onClick={handleLogout} style={{ fontSize: "13px" }}>
                                Salir
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setMostrarLogin(true)}
                            style={{
                                fontSize: "13px", fontWeight: "500",
                                background: "var(--color-background-info)",
                                color: "var(--color-text-info)",
                                border: "none",
                                padding: "6px 16px",
                                borderRadius: "var(--border-radius-md)",
                                cursor: "pointer",
                            }}
                        >
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
                        padding: "1.75rem 1.5rem",
                        width: "300px",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    }}>
                        {/* Ícono */}
                        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                            <div style={{
                                width: "44px", height: "44px", borderRadius: "50%",
                                background: "var(--color-background-secondary)",
                                border: "0.5px solid var(--color-border-tertiary)",
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                     stroke="var(--color-text-secondary)" strokeWidth="1.5"
                                     strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="4"/>
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                                </svg>
                            </div>
                            <h2 style={{ fontSize: "16px", fontWeight: "500", margin: "10px 0 0", color: "var(--color-text-primary)" }}>
                                Login
                            </h2>
                        </div>

                        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: "500" }}>
                                    Usuario
                                </label>
                                <input
                                    type="email" value={correo}
                                    onChange={e => setCorreo(e.target.value)}
                                    required placeholder="correo@ejemplo.com"
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: "500" }}>
                                    Clave
                                </label>
                                <input
                                    type="password" value={clave}
                                    onChange={e => setClave(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <p style={{ fontSize: "12px", color: "var(--color-text-danger)", margin: 0 }}>
                                    {error}
                                </p>
                            )}

                            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                <button
                                    type="button"
                                    onClick={() => { setMostrarLogin(false); setError(""); }}
                                    style={{ flex: 1, padding: "7px 0", fontSize: "13px" }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1, padding: "7px 0", fontSize: "13px",
                                        background: "var(--color-primary)",
                                        borderColor: "var(--color-primary)",
                                        color: "#fff", fontWeight: "500",
                                    }}
                                >
                                    Ingresar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}


function NavLink({ to, children }) {
    return (
        <Link to={to} style={{
            textDecoration: "none",
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            padding: "5px 10px",
            borderRadius: "var(--border-radius-md)",
            transition: "color 0.15s, background 0.15s",
            fontWeight: "400",
        }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--color-background-secondary)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
        >
            {children}
        </Link>
    );
}
