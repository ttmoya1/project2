const BASE_URL = "http://localhost:8080";

// Obtiene el token guardado
const getToken = () => localStorage.getItem("token");

// Fetch autenticado (con JWT)
const authFetch = (url, options = {}) => {
    return fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            ...options.headers,
        },
    });
};

// Fetch público (sin JWT)
const publicFetch = (url, options = {}) => {
    return fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
};

// ── AUTH ────────────────────────────────────────────────────────────────────
export const loginApi = (correo, clave) =>
    publicFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ correo, clave }),
    });

// ── PÚBLICO ─────────────────────────────────────────────────────────────────
export const getPuestosRecientes = () =>
    publicFetch("/api/public/puestos/recientes");

export const buscarPuestosPublicos = (caracteristicaIds) =>
    publicFetch(
        `/api/public/puestos/buscar?caracteristicaIds=${caracteristicaIds.join(",")}`
    );

export const getCaracteristicasPublicas = () =>
    publicFetch("/api/public/caracteristicas");

// ── REGISTRO PÚBLICO ────────────────────────────────────────────────────────
export const registrarEmpresa = (data) =>
    publicFetch("/api/public/empresa/registro", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const registrarOferente = (data) =>
    publicFetch("/api/public/oferente/registro", {
        method: "POST",
        body: JSON.stringify(data),
    });

// ── EMPRESA ─────────────────────────────────────────────────────────────────
export const getDashboardEmpresa = () =>
    authFetch("/api/empresa/dashboard");

export const getMisPuestos = () =>
    authFetch("/api/empresa/puestos");

export const publicarPuesto = (data) =>
    authFetch("/api/empresa/puestos", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const desactivarPuesto = (id) =>
    authFetch(`/api/empresa/puestos/${id}/desactivar`, { method: "PUT" });

export const buscarCandidatos = (puestoId) =>
    authFetch(`/api/empresa/puestos/${puestoId}/candidatos`);

export const getDetalleCandidato = (oferenteId) =>
    authFetch(`/api/empresa/candidatos/${oferenteId}`);

// ── OFERENTE ─────────────────────────────────────────────────────────────────
export const getDashboardOferente = () =>
    authFetch("/api/oferente/dashboard");

export const actualizarHabilidades = (habilidades) =>
    authFetch("/api/oferente/habilidades", {
        method: "PUT",
        body: JSON.stringify({ habilidades }),
    });

// ── ADMIN ────────────────────────────────────────────────────────────────────
export const getEmpresasPendientes = () =>
    authFetch("/api/admin/empresas/pendientes");

export const aprobarEmpresa = (id) =>
    authFetch(`/api/admin/empresas/${id}/aprobar`, { method: "PUT" });

export const getOferentesPendientes = () =>
    authFetch("/api/admin/oferentes/pendientes");

export const aprobarOferente = (id) =>
    authFetch(`/api/admin/oferentes/${id}/aprobar`, { method: "PUT" });

export const getCaracteristicasAdmin = () =>
    authFetch("/api/admin/caracteristicas");

export const crearCaracteristica = (nombre, padreId) =>
    authFetch("/api/admin/caracteristicas", {
        method: "POST",
        body: JSON.stringify({ nombre, padreId }),
    });