
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ExerciseVideoView from "@/components/exercise-videos/ExerciseVideoView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const VerVideoPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  
  if (!videoId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Error: ID de video no proporcionado</h2>
        <p className="mb-6">No se ha encontrado el ID del video en la URL.</p>
        <Button onClick={() => navigate("/videos-ejercicios")}>
          Volver a la lista de videos
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/videos-ejercicios')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Detalle del Video</h2>
      </div>
      
      <ExerciseVideoView videoId={videoId} />
    </div>
  );
};

export default VerVideoPage;
