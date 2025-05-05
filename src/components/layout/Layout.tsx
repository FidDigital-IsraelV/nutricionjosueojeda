import React, { useState } from "react";
import { Outlet, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import { 
  Users, PieChart, FileText, TrendingUp,
  Scale, Video, Utensils, ChartLine, FlaskRound,
  Trophy, ClipboardList, User, Calendar,
  BarChart3, BellRing, UserPlus, Settings
} from "lucide-react";
import DesktopSidebar from "./DesktopSidebar";
import ClientSidebar from "./ClientSidebar";
import MobileHeader from "./MobileHeader";

interface NavSection {
  title: string;
  icon?: React.ReactNode;
  items: {
    path: string;
    label: string;
    icon: React.ReactNode;
    roles?: string[];
  }[];
  isOpen?: boolean;
}

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = currentUser.role === "admin";
  const isNutritionist = currentUser.role === "nutritionist";
  const isTrainer = currentUser.role === "trainer";
  
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({
    "Gestión de Clientes": true,
    "Repositorio Multimedia": false,
    "Nutrición": true,
    "Entrenamiento": true,
    "Gestión de Usuarios": false,
    "Planificación": false,
    "Analíticas": true,
    "Administración": true
  });
  
  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };
  
  const adminNavSections: NavSection[] = [
    {
      title: "Gestión de Usuarios",
      items: [
        { 
          path: "/pacientes", 
          label: "Pacientes", 
          icon: <User size={20} />,
          roles: ["admin", "nutritionist", "trainer"]
        },
        { 
          path: "/medidas-corporales", 
          label: "Medidas Corporales", 
          icon: <Scale size={20} />,
          roles: ["admin", "nutritionist", "trainer"]
        },
      ]
    },
    {
      title: "Nutrición",
      items: [
        { 
          path: "/planes-nutricionales", 
          label: "Planes Nutricionales", 
          icon: <FileText size={20} />,
          roles: ["admin", "nutritionist"]
        },
        { 
          path: "/comidas", 
          label: "Comidas", 
          icon: <Utensils size={20} />,
          roles: ["admin", "nutritionist"]
        },
        { 
          path: "/seguimiento-nutricional", 
          label: "Seguimiento Nutricional", 
          icon: <ChartLine size={20} />,
          roles: ["admin", "nutritionist"]
        },
        { 
          path: "/suplementos", 
          label: "Suplementos", 
          icon: <FlaskRound size={20} />,
          roles: ["admin", "nutritionist"]
        },
        { 
          path: "/logros-comidas", 
          label: "Logros de Comidas", 
          icon: <Trophy size={20} />,
          roles: ["admin", "nutritionist"]
        },
      ]
    },
    {
      title: "Entrenamiento",
      items: [
        { 
          path: "/planes-entrenamiento", 
          label: "Planes de Entrenamiento", 
          icon: <ClipboardList size={20} />,
          roles: ["admin", "nutritionist", "trainer"]
        },
        { 
          path: "/videos-ejercicios", 
          label: "Videos De Ejercicios", 
          icon: <Video size={20} />,
          roles: ["admin", "nutritionist", "trainer"]
        },
      ]
    },
    {
      title: "Planificación",
      items: [
        { 
          path: "/sesiones-nutricion", 
          label: "Sesiones de Nutrición", 
          icon: <Calendar size={20} />,
          roles: ["admin", "nutritionist"]
        },
      ]
    },
    {
      title: "Recursos",
      items: [
        { 
          path: "/guias", 
          label: "Guías", 
          icon: <FileText size={20} />,
          roles: ["admin", "nutritionist", "trainer"]
        },
      ]
    },
    {
      title: "Analíticas",
      items: [
        { 
          path: "/reportes", 
          label: "Reportes", 
          icon: <BarChart3 size={20} />,
          roles: ["admin", "nutritionist", "trainer"]
        },
      ]
    }
  ];

  const filteredNavSections = adminNavSections.map(section => {
    return {
      ...section,
      items: section.items.filter(item => 
        !item.roles || item.roles.includes(currentUser.role)
      )
    };
  }).filter(section => section.items.length > 0);
  
  const clientNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: <PieChart size={20} /> },
    { path: "/my-plan", label: "Mi Plan", icon: <FileText size={20} /> },
    { path: "/progress", label: "Progreso", icon: <TrendingUp size={20} /> },
    { path: "/sesiones-nutricion", label: "Mis Sesiones", icon: <Calendar size={20} /> },
    { path: "/videos-ejercicios", label: "Videos de Ejercicios", icon: <Video size={20} /> },
    { path: "/guias", label: "Guías", icon: <FileText size={20} /> },
    { path: "/notificaciones", label: "Notificaciones", icon: <BellRing size={20} /> },
    { path: "/profile", label: "Mi Perfil", icon: <User size={20} /> },
  ];

  const navSections = isNutritionist || isTrainer || isAdmin ? filteredNavSections : [];
  const navItems = isNutritionist || isTrainer || isAdmin ? [] : clientNavItems;

  return (
    <div className="flex min-h-screen bg-background">
      {isNutritionist || isTrainer || isAdmin ? (
        <DesktopSidebar 
          user={currentUser}
          unreadCount={unreadCount}
          navSections={navSections}
          openSections={openSections}
          toggleSection={toggleSection}
          location={location}
          logout={logout}
        />
      ) : (
        <ClientSidebar
          user={currentUser}
          navItems={navItems}
          location={location}
          unreadCount={unreadCount}
          logout={logout}
        />
      )}

      <MobileHeader
        user={currentUser}
        unreadCount={unreadCount}
        navSections={navSections}
        navItems={navItems}
        logout={logout}
      />

      <main className="flex-1 md:p-8 p-4 md:pt-8 pt-16 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
