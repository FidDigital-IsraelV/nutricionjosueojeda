
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useParams } from "react-router-dom";
import NutritionSessionForm from "@/components/nutrition-sessions/NutritionSessionForm";
import { useData } from "@/context/DataContext";

const EditarSesionPage = () => {
  const { currentUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const { getNutritionSessionById } = useData();
  
  const session = getNutritionSessionById(id || "");

  // Solo permitir acceso a nutricionistas o entrenadores
  if (currentUser.role === "client") {
    return <Navigate to="/sesiones-nutricion" replace />;
  }
  
  // Verificar si la sesión existe
  if (!session) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-800">Sesión no encontrada</h2>
        <p className="mt-2 text-gray-600">La sesión que intenta editar no existe o ha sido eliminada.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Editar Sesión De Nutrición</h1>
      <NutritionSessionForm mode="edit" session={session} />
    </div>
  );
};

export default EditarSesionPage;
