
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import MedidasCorporalesPage from "./MedidasCorporalesPage";

const MedidasClientePage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { getClientById } = useData();
  
  // Si no hay ID, redirigir a la página principal
  if (!id) {
    return <Navigate to="/medidas-corporales" replace />;
  }

  // Buscar el cliente
  const client = getClientById(id);
  
  // Si el cliente no existe, redirigir a la página principal
  if (!client) {
    return <Navigate to="/medidas-corporales" replace />;
  }

  // Si el usuario es un cliente, solo puede ver sus propias medidas
  if (currentUser?.role === "client" && currentUser?.id !== client.userId) {
    return <Navigate to="/medidas-corporales" replace />;
  }
  
  return <MedidasCorporalesPage clientId={id} />;
};

export default MedidasClientePage;
