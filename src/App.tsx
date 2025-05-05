
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { ThemeProvider } from "./components/theme/theme-provider";

// Import pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import MedidasCorporalesPage from "./pages/medidas-corporales/MedidasCorporalesPage";
import CrearMedidaPage from "./pages/medidas-corporales/CrearMedidaPage";
import MedidasClientePage from "./pages/medidas-corporales/MedidasClientePage";
import VideosEjerciciosPage from "./pages/videos-ejercicios/VideosEjerciciosPage";
import CrearVideoPage from "./pages/videos-ejercicios/CrearVideoPage";
import VerVideoPage from "./pages/videos-ejercicios/VerVideoPage";
import EditarVideoPage from "./pages/videos-ejercicios/EditarVideoPage";
import GuiasPage from "./pages/guias/GuiasPage";
import ComidasPage from "./pages/comidas/ComidasPage";
import PlanesNutricionalesPage from "./pages/planes-nutricionales/PlanesNutricionalesPage";
import SeguimientoNutricionalPage from "./pages/seguimiento-nutricional/SeguimientoNutricionalPage";
import SuplementosPage from "./pages/suplementos/SuplementosPage";
import LogrosTest from "./pages/logros-comidas/LogrosTest";
import PlanesEntrenamientoPage from "./pages/planes-entrenamiento/PlanesEntrenamientoPage";
import SesionesNutricionPage from "./pages/sesiones-nutricion/SesionesNutricionPage";
import CrearSesionPage from "./pages/sesiones-nutricion/CrearSesionPage";
import VerSesionPage from "./pages/sesiones-nutricion/VerSesionPage";
import EditarSesionPage from "./pages/sesiones-nutricion/EditarSesionPage";
import PacientesPage from "./pages/pacientes/Pacientes";
import ClientesPage from "./pages/pacientes/ClientesPage";
import CrearPlanEntrenamientoPage from "./pages/planes-entrenamiento/CrearPlanEntrenamientoPage";
import PlanEntrenamientoDetailPage from "./pages/planes-entrenamiento/PlanEntrenamientoDetailPage";
import Progress from "./pages/progress/Progress";
import ReportesPage from "./pages/reportes/ReportesPage";
import ProfilePage from "./pages/ProfilePage";
import NotificacionesPage from "./pages/notificaciones/NotificacionesPage";
import MyPlanPage from "./pages/my-plan/MyPlanPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <DataProvider>
          <NotificationsProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<Layout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="medidas-corporales" element={<MedidasCorporalesPage />} />
                  <Route path="medidas-corporales/new" element={<CrearMedidaPage />} />
                  <Route path="medidas-corporales/:id" element={<MedidasClientePage />} />
                  <Route path="videos-ejercicios" element={<VideosEjerciciosPage />} />
                  <Route path="videos-ejercicios/crear" element={<CrearVideoPage />} />
                  <Route path="videos-ejercicios/:videoId" element={<VerVideoPage />} />
                  <Route path="videos-ejercicios/:videoId/edit" element={<EditarVideoPage />} />
                  <Route path="guias" element={<GuiasPage />} />
                  <Route path="comidas" element={<ComidasPage />} />
                  <Route path="planes-nutricionales" element={<PlanesNutricionalesPage />} />
                  <Route path="planes-nutricionales/:planId" element={<PlanesNutricionalesPage />} />
                  <Route path="planes-nutricionales/editar/:planId" element={<PlanesNutricionalesPage />} />
                  <Route path="seguimiento-nutricional" element={<SeguimientoNutricionalPage />} />
                  <Route path="suplementos" element={<SuplementosPage />} />
                  <Route path="suplementos/crear" element={<SuplementosPage />} />
                  <Route path="suplementos/:id" element={<SuplementosPage />} />
                  <Route path="logros-comidas" element={<LogrosTest />} />
                  <Route path="planes-entrenamiento" element={<PlanesEntrenamientoPage />} />
                  <Route path="planes-entrenamiento/new" element={<CrearPlanEntrenamientoPage />} />
                  <Route path="planes-entrenamiento/:planId" element={<PlanEntrenamientoDetailPage />} />
                  <Route path="planes-entrenamiento/editar/:planId" element={<CrearPlanEntrenamientoPage />} />
                  <Route path="sesiones-nutricion" element={<SesionesNutricionPage />} />
                  <Route path="sesiones-nutricion/crear" element={<CrearSesionPage />} />
                  <Route path="sesiones-nutricion/:sessionId" element={<VerSesionPage />} />
                  <Route path="sesiones-nutricion/:sessionId/edit" element={<EditarSesionPage />} />
                  <Route path="pacientes" element={<PacientesPage />} />
                  <Route path="clientes" element={<ClientesPage />} />
                  <Route path="progress" element={<Progress />} />
                  <Route path="reportes" element={<ReportesPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="notificaciones" element={<NotificacionesPage />} />
                  <Route path="my-plan" element={<MyPlanPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster 
                position="top-center" 
                richColors 
                closeButton 
                duration={5000}
                visibleToasts={3}
              />
            </Router>
          </NotificationsProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
