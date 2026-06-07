import { useEffect, useState, useRef } from "react";
import { getDashboardOferente } from "../../api/api";

const BASE_URL = "http://localhost:8080";
const getToken = () => localStorage.getItem("token");

export default function MiCurriculo() {
    const [tieneCurriculo, setTieneCurriculo] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [subiendo, setSubiendo] = useState(false);
    const [viendoPdf, setViendoPdf] = useState(false);
    const [msg, setMsg] = useState({ tipo: "", texto: "" });
    const inputRef = useRef(null);

    useEffect(() => {
        getDashboardOferente()
            .then(r => r.json())
            .then(data => setTieneCurriculo(data.tieneCurriculo === true))
            .catch(() => setMsg({ tipo: "error", texto: "Error al verificar el currículo." }))
            .finally(() => setCargando(false));
    }, []);

    const handleSubir = async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;

        if (archivo.type !== "application/pdf") {
            setMsg({ tipo: "error", texto: "Solo se aceptan archivos PDF." });
            return;
        }
        if (archivo.size > 5 * 1024 * 1024) {
            setMsg({ tipo: "error", texto: "El archivo no puede superar los 5 MB." });
            return;
        }

        setSubiendo(true);
        setMsg({ tipo: "", texto: "" });

        const formData = new FormData();
        formData.append("archivo", archivo);

        try {
            const res = await fetch(`${BASE_URL}/api/oferente/curriculo`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData,
            });
            if (!res.ok) throw new Error();
            setTieneCurriculo(true);
            setMsg({ tipo: "success", texto: "¡Currículo subido correctamente!" });
        } catch {
            setMsg({ tipo: "error", texto: "Error al subir el archivo. Intentá de nuevo." });
        } finally {
            setSubiendo(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };


    const handleVerPdf = async () => {
        setViendoPdf(true);
        setMsg({ tipo: "", texto: "" });
        try {
            const res = await fetch(`${BASE_URL}/api/oferente/curriculo`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");

            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch {
            setMsg({ tipo: "error", texto: "No se pudo abrir el currículo." });
        } finally {
            setViendoPdf(false);
        }
    };

    if (cargando) return <div className="page"><p className="msg-empty">Cargando...</p></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Mi Currículo</h1>
                    <p style={{ marginTop: "2px" }}>
                        Subí tu CV en formato PDF para que las empresas puedan verlo.
                    </p>
                </div>
            </div>

            {msg.texto && (
                <p className={msg.tipo === "error" ? "msg-error" : "msg-success"}
                   style={{ marginBottom: "1.25rem" }}>
                    {msg.texto}
                </p>
            )}

            <div className="card" style={{ maxWidth: "560px" }}>

                {/* Estado actual */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "1rem", borderRadius: "var(--border-radius-md)",
                    background: tieneCurriculo
                        ? "var(--color-background-success)"
                        : "var(--color-background-secondary)",
                    marginBottom: "1.25rem",
                }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: tieneCurriculo
                            ? "var(--color-background-success)"
                            : "var(--color-background-tertiary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        {tieneCurriculo ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                 stroke="var(--color-text-success)" strokeWidth="2"
                                 strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                 stroke="var(--color-text-secondary)" strokeWidth="1.5"
                                 strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                        )}
                    </div>
                    <div>
                        <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-text-primary)", margin: 0 }}>
                            {tieneCurriculo ? "Tenés un currículo subido" : "No tenés currículo subido aún"}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0 }}>
                            {tieneCurriculo
                                ? "Las empresas pueden verlo al buscar candidatos."
                                : "Subí tu CV para que aparezca en las búsquedas de empresas."}
                        </p>
                    </div>
                </div>

                {/* Botones */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

                    {/* Subir / Reemplazar */}
                    <div>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="application/pdf"
                            onChange={handleSubir}
                            style={{ display: "none" }}
                            id="input-pdf"
                        />
                        <label htmlFor="input-pdf" style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            padding: "7px 16px", borderRadius: "var(--border-radius-md)",
                            border: "0.5px solid var(--color-border-secondary)",
                            background: "transparent",
                            fontSize: "13px", fontWeight: "500",
                            color: "var(--color-text-primary)",
                            cursor: subiendo ? "not-allowed" : "pointer",
                            opacity: subiendo ? 0.6 : 1,
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2"
                                 strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            {subiendo ? "Subiendo..." : tieneCurriculo ? "Reemplazar PDF" : "Subir PDF"}
                        </label>
                    </div>

                    {/* Ver currículo — fetch con token, abre como blob */}
                    {tieneCurriculo && (
                        <button
                            onClick={handleVerPdf}
                            disabled={viendoPdf}
                            style={{
                                background: "transparent",
                                border: "0.5px solid var(--color-border-info)",
                                color: "var(--color-text-info)",
                                fontSize: "13px", fontWeight: "500",
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                padding: "7px 16px",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2"
                                 strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            {viendoPdf ? "Abriendo..." : "Ver mi currículo"}
                        </button>
                    )}
                </div>

                <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "1rem" }}>
                    Solo archivos PDF · Máximo 5 MB
                </p>
            </div>
        </div>
    );
}
