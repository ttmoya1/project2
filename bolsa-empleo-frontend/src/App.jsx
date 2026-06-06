import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Páginas públicas
import Inicio from "./pages/public/Inicio";
import Buscar from "./pages/public/Buscar";
import RegistroEmpresa from "./pages/public/RegistroEmpresa";
import RegistroOferente from "./pages/public/RegistroOferente";

// Páginas empresa
import DashboardEmpresa from "./pages/empresa/DashboardEmpresa";
import MisPuestos from "./pages/empresa/MisPuestos";
import PublicarPuesto from "./pages/empresa/PublicarPuesto";
import Candidatos from "./pages/empresa/Candidatos";

// Páginas oferente
import DashboardOferente from "./pages/oferente/DashboardOferente";
import MisHabilidades from "./pages/oferente/MisHabilidades";

// Páginas admin
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import AprobarEmpresas from "./pages/admin/AprobarEmpresas";
import AprobarOferentes from "./pages/admin/AprobarOferentes";
import GestionCaracteristicas from "./pages/admin/GestionCaracteristicas";

// Componentes
import Navbar from "./components/Navbar";
import MiCurriculo from "./pages/oferente/MiCurriculo.jsx";

// Ruta protegida por rol
function RutaProtegida({ children, rol }) {
    const { auth } = useAuth();
    if (!auth) return <Navigate to="/" />;
    if (rol && auth.rol !== rol) return <Navigate to="/" />;
    return children;
}


export default function App() {
    return (
        <>
            <Navbar />
            <Routes>
                {/* Públicas */}
                <Route path="/" element={<Inicio />} />
                <Route path="/buscar" element={<Buscar />} />
                <Route path="/registro/empresa" element={<RegistroEmpresa />} />
                <Route path="/registro/oferente" element={<RegistroOferente />} />

                {/* Empresa */}
                <Route path="/empresa/dashboard" element={
                    <RutaProtegida rol="EMPRESA"><DashboardEmpresa /></RutaProtegida>
                } />
                <Route path="/empresa/puestos" element={
                    <RutaProtegida rol="EMPRESA"><MisPuestos /></RutaProtegida>
                } />
                <Route path="/empresa/puestos/nuevo" element={
                    <RutaProtegida rol="EMPRESA"><PublicarPuesto /></RutaProtegida>
                } />
                <Route path="/empresa/puestos/:id/candidatos" element={
                    <RutaProtegida rol="EMPRESA"><Candidatos /></RutaProtegida>
                } />

                {/* Oferente */}
                <Route path="/oferente/dashboard" element={
                    <RutaProtegida rol="OFERENTE"><DashboardOferente /></RutaProtegida>
                } />
                <Route path="/oferente/habilidades" element={
                    <RutaProtegida rol="OFERENTE"><MisHabilidades /></RutaProtegida>
                } />

                {/* Admin */}
                <Route path="/admin/dashboard" element={
                    <RutaProtegida rol="ADMINISTRADOR"><DashboardAdmin /></RutaProtegida>
                } />
                <Route path="/admin/empresas" element={
                    <RutaProtegida rol="ADMINISTRADOR"><AprobarEmpresas /></RutaProtegida>
                } />
                <Route path="/admin/oferentes" element={
                    <RutaProtegida rol="ADMINISTRADOR"><AprobarOferentes /></RutaProtegida>
                } />
                <Route path="/admin/caracteristicas" element={
                    <RutaProtegida rol="ADMINISTRADOR"><GestionCaracteristicas /></RutaProtegida>
                } />
                <Route path="/oferente/curriculo" element={
                    <RutaProtegida rol="OFERENTE"><MiCurriculo /></RutaProtegida>
                } />
                <Route path="/oferente/curriculo" element={
                    <RutaProtegida rol="OFERENTE"><MiCurriculo /></RutaProtegida>
                } />
            </Routes>
        </>
    );
}