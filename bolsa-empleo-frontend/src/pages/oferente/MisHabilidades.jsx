import { useEffect, useState } from "react";
import { getCaracteristicasPublicas, getDashboardOferente, actualizarHabilidades } from "../../api/api";
import { NIVELES, nivelLabel } from "../../utils/nivelUtils";

export default function MisHabilidades() {
    const [arbol, setArbol] = useState([]);
    const [seleccionadas, setSeleccionadas] = useState({});
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [msg, setMsg] = useState({ tipo: "", texto: "" });

    useEffect(() => {
        Promise.all([
            getCaracteristicasPublicas().then(r => r.json()),
            getDashboardOferente().then(r => r.json()),
        ])
            .then(([caracteristicas, oferente]) => {
                setArbol(caracteristicas);
                if (oferente.habilidades?.length > 0) {
                    const previas = {};
                    oferente.habilidades.forEach(c => {
                        const id = c.caracteristicaId ?? c.caracteristica?.id;
                        const nivel = c.nivel ?? c.nivelRequerido;
                        if (id) previas[id] = nivel;
                    });
                    setSeleccionadas(previas);
                }
            })
            .catch(() => setMsg({ tipo: "error", texto: "Error al cargar datos." }))
            .finally(() => setCargando(false));
    }, []);

    const toggleCaracteristica = (id) => {
        setSeleccionadas(prev => {
            const nuevo = { ...prev };
            if (nuevo[id] !== undefined) delete nuevo[id];
            else nuevo[id] = 1;
            return nuevo;
        });
    };

    const cambiarNivel = (id, nivel) => {
        setSeleccionadas(prev => ({ ...prev, [id]: Number(nivel) }));
    };

    const handleGuardar = async () => {
        setGuardando(true);
        setMsg({ tipo: "", texto: "" });
        try {
            const habilidades = Object.entries(seleccionadas).map(([id, nivel]) => ({
                caracteristicaId: Number(id),
                nivel: Number(nivel),
            }));
            const res = await actualizarHabilidades(habilidades);
            if (!res.ok) throw new Error();
            setMsg({ tipo: "success", texto: "¡Habilidades actualizadas correctamente!" });
        } catch {
            setMsg({ tipo: "error", texto: "Error al guardar. Intente de nuevo." });
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) return <div className="page"><p className="msg-empty">Cargando...</p></div>;

    const totalSeleccionadas = Object.keys(seleccionadas).length;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Mis Habilidades</h1>
                    <p style={{ marginTop: "2px" }}>
                        Seleccioná tus destrezas e indicá el nivel que tenés en cada una.
                    </p>
                </div>
                <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    style={{
                        background: "var(--color-primary)",
                        borderColor: "var(--color-primary)",
                        color: "#fff",
                        fontWeight: "500",
                        padding: "8px 20px",
                    }}
                >
                    {guardando ? "Guardando..." : `Guardar (${totalSeleccionadas})`}
                </button>
            </div>

            {msg.texto && (
                <p className={msg.tipo === "error" ? "msg-error" : "msg-success"} style={{ marginBottom: "1rem" }}>
                    {msg.texto}
                </p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {arbol.map(padre => (
                    <GrupoCaracteristica
                        key={padre.id}
                        grupo={padre}
                        seleccionadas={seleccionadas}
                        onToggle={toggleCaracteristica}
                        onNivel={cambiarNivel}
                    />
                ))}
            </div>
        </div>
    );
}

function GrupoCaracteristica({ grupo, seleccionadas, onToggle, onNivel }) {
    const [expandido, setExpandido] = useState(true);
    const hijos = grupo.hijos ?? grupo.children ?? [];

    if (hijos.length === 0) {
        return (
            <FilaCaracteristica
                item={grupo}
                seleccionadas={seleccionadas}
                onToggle={onToggle}
                onNivel={onNivel}
            />
        );
    }

    return (
        <div className="card" style={{ padding: "1rem" }}>
            <button
                onClick={() => setExpandido(e => !e)}
                style={{
                    width: "100%", background: "transparent", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0", cursor: "pointer", marginBottom: expandido ? "12px" : "0",
                }}
            >
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-primary)" }}>
                    {grupo.nombre}
                </span>
                <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="var(--color-text-secondary)" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: expandido ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                >
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </button>

            {expandido && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {hijos.map(hijo => (
                        <FilaCaracteristica
                            key={hijo.id}
                            item={hijo}
                            seleccionadas={seleccionadas}
                            onToggle={onToggle}
                            onNivel={onNivel}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function FilaCaracteristica({ item, seleccionadas, onToggle, onNivel }) {
    const marcado = seleccionadas[item.id] !== undefined;
    const nivel = seleccionadas[item.id] ?? 1;

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "6px 8px", borderRadius: "var(--border-radius-sm)",
            background: marcado ? "var(--color-background-info)" : "transparent",
            transition: "background 0.15s",
        }}>
            <input
                type="checkbox"
                checked={marcado}
                onChange={() => onToggle(item.id)}
                style={{ width: "15px", height: "15px", cursor: "pointer", flexShrink: 0 }}
            />
            <span style={{
                flex: 1, fontSize: "13px",
                color: marcado ? "var(--color-text-info)" : "var(--color-text-primary)",
                fontWeight: marcado ? "500" : "400",
            }}>
                {item.nombre}
            </span>

            {marcado && (
                <select
                    value={nivel}
                    onChange={e => onNivel(item.id, e.target.value)}
                    style={{
                        width: "110px", padding: "3px 6px", fontSize: "12px",
                        borderColor: "var(--color-border-info)",
                    }}
                >
                    {NIVELES.map(n => (
                        <option key={n.valor} value={n.valor}>{n.label}</option>
                    ))}
                </select>
            )}
        </div>
    );
}