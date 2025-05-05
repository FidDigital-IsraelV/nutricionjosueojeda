import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ExerciseVideo } from '@/types';
import { toast } from '@/lib/toast';

export const useExerciseVideos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllExerciseVideos = useCallback(async (): Promise<ExerciseVideo[]> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando consulta de videos...');

      const { data, error } = await supabase
        .from('exercise_videos')
        .select(`
          id,
          title,
          description,
          video_url,
          thumbnail_url,
          difficulty,
          muscle_group,
          is_public,
          created_at,
          updated_at,
          created_by
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error en la consulta:', error);
        throw error;
      }

      console.log('Datos recibidos de Supabase:', data);

      // Transformar los datos para que coincidan con el tipo ExerciseVideo
      const transformedData = data?.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.video_url,
        thumbnailUrl: video.thumbnail_url,
        difficulty: video.difficulty,
        muscleGroup: video.muscle_group,
        isPublic: video.is_public,
        createdAt: video.created_at,
        updatedAt: video.updated_at,
        createdBy: video.created_by
      })) || [];

      console.log('Datos transformados:', transformedData);
      return transformedData;
    } catch (err) {
      console.error('Error al obtener videos de ejercicios:', err);
      setError('Error al cargar los videos de ejercicios');
      toast.error('Error al cargar los videos de ejercicios');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getExerciseVideoById = useCallback(async (id: string): Promise<ExerciseVideo | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('exercise_videos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error al obtener video de ejercicio:', err);
      setError('Error al cargar el video de ejercicio');
      toast.error('Error al cargar el video de ejercicio');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addExerciseVideo = useCallback(async (video: Omit<ExerciseVideo, 'id' | 'createdAt'>): Promise<ExerciseVideo | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('exercise_videos')
        .insert([{
          ...video,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Video de ejercicio registrado correctamente');
      return data;
    } catch (err) {
      console.error('Error al crear video de ejercicio:', err);
      setError('Error al crear el video de ejercicio');
      toast.error('Error al crear el video de ejercicio');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExerciseVideo = useCallback(async (video: ExerciseVideo): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('exercise_videos')
        .update({
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          difficulty: video.difficulty,
          muscleGroup: video.muscleGroup,
          isPublic: video.isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id);

      if (error) throw error;

      toast.success('Video de ejercicio actualizado correctamente');
      return true;
    } catch (err) {
      console.error('Error al actualizar video de ejercicio:', err);
      setError('Error al actualizar el video de ejercicio');
      toast.error('Error al actualizar el video de ejercicio');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExerciseVideo = async (id: string): Promise<boolean> => {
    try {
      console.log('Intentando eliminar video con ID:', id);
      
      // Primero verificar si el video existe
      const { data: existingData, error: fetchError } = await supabase
        .from('exercise_videos')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error al buscar el video:', fetchError);
        return false;
      }

      console.log('Video encontrado:', existingData);

      // Intentar eliminar
      const { data, error } = await supabase
        .from('exercise_videos')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error de Supabase al eliminar:', error);
        return false;
      }

      console.log('Resultado de la eliminación:', data);
      
      // Verificar si realmente se eliminó
      const { data: verifyData, error: verifyError } = await supabase
        .from('exercise_videos')
        .select('*')
        .eq('id', id)
        .single();

      if (verifyError) {
        console.log('El video ya no existe (éxito)');
      } else {
        console.log('El video aún existe después de la eliminación:', verifyData);
      }

      return true;
    } catch (err) {
      console.error('Error al eliminar video:', err);
      return false;
    }
  };

  return {
    loading,
    error,
    getAllExerciseVideos,
    getExerciseVideoById,
    addExerciseVideo,
    updateExerciseVideo,
    deleteExerciseVideo
  };
}; 