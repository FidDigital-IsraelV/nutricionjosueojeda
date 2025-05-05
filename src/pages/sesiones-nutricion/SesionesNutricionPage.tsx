
import React from "react";
import { useAuth } from "@/context/AuthContext";
import NutritionSessionList from "@/components/nutrition-sessions/NutritionSessionList";

const SesionesNutricionPage = () => {
  const { currentUser } = useAuth();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {currentUser.role === "client" ? "Mis Sesiones de Nutrición" : "Sesiones de Nutrición"}
      </h1>
      <NutritionSessionList />
    </div>
  );
};

export default SesionesNutricionPage;
