
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import NutritionSessionForm from "@/components/nutrition-sessions/NutritionSessionForm";

const CrearSesionPage = () => {
  const { currentUser } = useAuth();

  // Solo permitir acceso a nutricionistas o entrenadores
  if (currentUser.role === "client") {
    return <Navigate to="/sesiones-nutricion" replace />;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Crear Sesión De Nutrición</h1>
      <NutritionSessionForm mode="create" />
    </div>
  );
};

export default CrearSesionPage;
