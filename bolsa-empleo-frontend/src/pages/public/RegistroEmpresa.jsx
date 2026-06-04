import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarEmpresa } from "../../api/api";

export default function RegistroEmpresa() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ nombre: "", localizacion: "", correo: "", clave: "", telefono: "", descripcion: "" });
    const [error, setError] = useState("");
    const [exito, setExito] = useState(false);
    const [cargando, setCargando] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setCargando(true); setError("");
        try {
            const res = await registrarEmpresa(form);
            if (!res.ok) { const d = await res.text(); throw new Error(d || "Error al registrar"); }
            setExito(true);
        } catch (err) { setError(err.message); }
        finally { setCargando(false); }
    };

    if (exito) return (
        <div style={{ maxWidth: "480px", margin: "4rem auto", padding: "0 1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "22px", fontWeight: "500", marginBottom: "0.5rem" }}>¡Registro exitoso!</p>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "1.5rem" }}>
                Tu empresa fue registrada. Un administrador debe aprobarla antes de que puedas ingresar.
            </p>
            <button onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
    );

    const campo = (label, name, type = "text", requerido = true) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{label}</label>
            {name === "descripcion" ? (
                <textarea name={name} value={form[name]} onChange={handleChange} rows={3}
                          style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }} />
            ) : (
                <input type={type} name={name} value={form[name]} onChange={handleChange}
                       required={requerido} style={{ width: "100%", boxSizing: "border-box" }} />
            )}
        </div>
    );

    return (
        <div style={{ maxWidth: "480px", margin: "3rem auto", padding: "0 1.5rem" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "500", margin: "0 0 1.5rem" }}>Registro de empresa</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {campo("Nombre", "nombre")}
                {campo("Correo electrónico", "correo", "email")}
                {campo("Contraseña", "clave", "password")}
                {campo("Teléfono", "telefono", "tel", false)}
                {campo("Localización", "localizacion", "text", false)}
                {campo("Descripción", "descripcion", "text", false)}
                {error && <p style={{ fontSize: "13px", color: "var(--color-text-danger)", margin: 0 }}>{error}</p>}
                <button type="submit" disabled={cargando} style={{ marginTop: "4px" }}>
                    {cargando ? "Registrando…" : "Registrar empresa"}
                </button>
            </form>
        </div>
    );
}