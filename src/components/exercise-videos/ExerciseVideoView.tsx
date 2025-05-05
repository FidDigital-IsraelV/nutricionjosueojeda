
import React from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowLeft, Edit } from "lucide-react";

interface ExerciseVideoViewProps {
  videoId: string;
}

const ExerciseVideoView = ({ videoId }: ExerciseVideoViewProps) => {
  const { getExerciseVideoById } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const video = getExerciseVideoById(videoId);
  const canEdit = currentUser?.role === "nutritionist" || currentUser?.role === "trainer";
  
  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Video no encontrado</h2>
        <p className="mb-6">El video que estás buscando no existe o ha sido eliminado.</p>
        <Button onClick={() => navigate("/videos-ejercicios")}>
          Volver a la lista de videos
        </Button>
      </div>
    );
  }
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/videos-ejercicios")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          {canEdit && (
            <Button size="sm" variant="outline" asChild>
              <a href={`/videos-ejercicios/${video.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </a>
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <CardTitle className="text-2xl">{video.title}</CardTitle>
          <Badge variant={
            video.difficulty === 'principiante' ? 'outline' : 
            video.difficulty === 'intermedio' ? 'secondary' : 
            'destructive'
          }>
            {video.difficulty}
          </Badge>
        </div>
        <CardDescription>
          Grupo muscular: {video.muscleGroup}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <AspectRatio ratio={16/9} className="bg-black rounded-md overflow-hidden">
          {/* Aquí se integraría un reproductor de video real */}
          {video.videoUrl.startsWith("http") ? (
            <iframe 
              src={video.videoUrl} 
              className="w-full h-full" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-muted">
              <p className="text-muted-foreground">
                Esta es una representación del video. En una implementación real, aquí se mostraría el reproductor.
              </p>
            </div>
          )}
        </AspectRatio>
        
        <div>
          <h3 className="font-semibold mb-2">Descripción</h3>
          <p className="text-muted-foreground whitespace-pre-line">{video.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseVideoView;
