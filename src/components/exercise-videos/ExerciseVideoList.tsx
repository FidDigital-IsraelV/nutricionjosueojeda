import { useState, useEffect, useCallback, useMemo } from 'react';
import { useExerciseVideos } from '@/hooks/useExerciseVideos';
import { ExerciseVideo } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Edit, Trash2, Search, X, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const getYouTubeEmbedUrl = (url: string) => {
  // Extraer el ID del video de la URL
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  // Si no es una URL de YouTube válida, devolver la URL original
  return url;
};

export const ExerciseVideoList = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<ExerciseVideo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof ExerciseVideo>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<ExerciseVideo | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);

  const {
    loading,
    error,
    getAllExerciseVideos,
    deleteExerciseVideo
  } = useExerciseVideos();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const loadVideos = useCallback(async () => {
    console.log('Cargando videos...');
    const data = await getAllExerciseVideos();
    console.log('Videos cargados:', data);
    if (isMounted) {
      setVideos(data);
      console.log('Videos actualizados en el estado:', data);
    }
  }, [getAllExerciseVideos, isMounted]);

  useEffect(() => {
    console.log('Componente montado, iniciando carga de videos');
    loadVideos();
  }, [loadVideos]);

  const filteredAndSortedVideos = useMemo(() => {
    console.log('Filtrando y ordenando videos...');
    console.log('Videos actuales:', videos);
    console.log('Término de búsqueda:', searchTerm);
    
    const result = videos
      .filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? new Date(aValue).getTime() - new Date(bValue).getTime()
            : new Date(bValue).getTime() - new Date(aValue).getTime();
        }
        
        return 0;
      });

    console.log('Videos filtrados y ordenados:', result);
    return result;
  }, [videos, searchTerm, sortField, sortDirection]);

  const handleSort = useCallback((field: keyof ExerciseVideo) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const handleView = useCallback((video: ExerciseVideo) => {
    setSelectedVideo(video);
  }, []);

  const handleEdit = useCallback((video: ExerciseVideo) => {
    navigate(`/exercise-videos/${video.id}/edit`);
  }, [navigate]);

  const handleDelete = useCallback((video: ExerciseVideo) => {
    setVideoToDelete(video);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!videoToDelete) return;

    const success = await deleteExerciseVideo(videoToDelete.id);
    if (success) {
      setVideos(prev => prev.filter(v => v.id !== videoToDelete.id));
      toast.success('Video eliminado correctamente');
    } else {
      toast.error('Error al eliminar el video');
    }

    setDeleteDialogOpen(false);
    setVideoToDelete(null);
  }, [videoToDelete, deleteExerciseVideo]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const closeVideo = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 relative">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <X
              className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={clearSearch}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredAndSortedVideos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron videos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold line-clamp-1">{video.title}</CardTitle>
                  <Badge variant={
                    video.difficulty === 'principiante' ? 'outline' : 
                    video.difficulty === 'intermedio' ? 'secondary' : 
                    'destructive'
                  }>
                    {video.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <AspectRatio ratio={16/9} className="bg-muted rounded-md mb-2 overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-muted">
                      <Play className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                  )}
                </AspectRatio>
                <div>
                  <Badge variant="outline" className="mr-2">{video.muscleGroup}</Badge>
                  {!video.isPublic && <Badge variant="outline" className="bg-yellow-100">Privado</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{video.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="secondary" size="sm" onClick={() => handleView(video)}>
                  <Play className="h-4 w-4 mr-1" />
                  Ver Video
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(video)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
              <Button variant="ghost" size="icon" onClick={closeVideo}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <AspectRatio ratio={16/9}>
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.videoUrl)}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-md"
                />
              </AspectRatio>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{selectedVideo.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{selectedVideo.difficulty}</Badge>
                  <Badge variant="secondary">{selectedVideo.muscleGroup}</Badge>
                  {selectedVideo.isPublic && (
                    <Badge variant="outline">Público</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El video será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExerciseVideoList;
