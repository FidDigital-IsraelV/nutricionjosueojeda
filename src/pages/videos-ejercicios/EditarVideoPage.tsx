
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ExerciseVideoForm from "@/components/exercise-videos/ExerciseVideoForm";
import { useData } from "@/context/DataContext";

const EditarVideoPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { getExerciseVideoById } = useData();
  
  // Solo nutricionistas y entrenadores pueden editar videos
  if (currentUser?.role !== "nutritionist" && currentUser?.role !== "trainer") {
    return <Navigate to="/videos-ejercicios" replace />;
  }
  
  // Verificar que el video existe
  const video = id ? getExerciseVideoById(id) : undefined;
  if (!video) {
    return <Navigate to="/videos-ejercicios" replace />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link to="/videos-ejercicios">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Videos De Ejercicios
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Editar Video De Ejercicio</h1>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <ExerciseVideoForm 
          videoId={id} 
          onSuccess={() => window.location.href = "/videos-ejercicios"}
        />
      </div>
    </div>
  );
};

export default EditarVideoPage;
