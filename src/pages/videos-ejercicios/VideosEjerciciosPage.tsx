
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import ExerciseVideoList from "@/components/exercise-videos/ExerciseVideoList";

const VideosEjerciciosPage = () => {
  const { currentUser } = useAuth();
  const canCreate = currentUser?.role === "nutritionist" || currentUser?.role === "trainer";
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Videos De Ejercicios</h1>
        
        {canCreate && (
          <Button asChild>
            <Link to="/videos-ejercicios/crear">
              <Plus className="h-4 w-4 mr-2" /> 
              Crear
            </Link>
          </Button>
        )}
      </div>
      
      <ExerciseVideoList />
    </div>
  );
};

export default VideosEjerciciosPage;
