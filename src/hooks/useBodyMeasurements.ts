import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { BodyMeasurement } from '@/types';
import { toast } from '@/lib/toast';

export const useBodyMeasurements = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllBodyMeasurements = useCallback(async (): Promise<BodyMeasurement[]> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Obteniendo todas las medidas corporales...');

      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }

      console.log('Medidas obtenidas:', data);
      return data || [];
    } catch (err) {
      console.error('Error al obtener medidas corporales:', err);
      setError('Error al cargar las medidas corporales');
      toast.error('Error al cargar las medidas corporales');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getBodyMeasurementsByClient = useCallback(async (clientId: string): Promise<BodyMeasurement[]> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Obteniendo medidas para el cliente ${clientId}...`);

      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }

      console.log('Medidas del cliente obtenidas:', data);
      return data || [];
    } catch (err) {
      console.error('Error al obtener medidas corporales:', err);
      setError('Error al cargar las medidas corporales');
      toast.error('Error al cargar las medidas corporales');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getBodyMeasurementById = useCallback(async (id: string): Promise<BodyMeasurement | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error al obtener medida corporal:', err);
      setError('Error al cargar la medida corporal');
      toast.error('Error al cargar la medida corporal');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addBodyMeasurement = useCallback(async (measurement: Omit<BodyMeasurement, 'id' | 'createdAt'>): Promise<BodyMeasurement | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('body_measurements')
        .insert([{
          ...measurement,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Medida corporal registrada correctamente');
      return data;
    } catch (err) {
      console.error('Error al crear medida corporal:', err);
      setError('Error al crear la medida corporal');
      toast.error('Error al crear la medida corporal');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBodyMeasurement = useCallback(async (measurement: BodyMeasurement): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('body_measurements')
        .update({
          date: measurement.date,
          measurements: measurement.measurements,
          notes: measurement.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', measurement.id);

      if (error) throw error;

      toast.success('Medida corporal actualizada correctamente');
      return true;
    } catch (err) {
      console.error('Error al actualizar medida corporal:', err);
      setError('Error al actualizar la medida corporal');
      toast.error('Error al actualizar la medida corporal');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBodyMeasurement = async (id: string): Promise<boolean> => {
    try {
      console.log('Intentando eliminar medida con ID:', id);
      
      // Primero verificar si la medida existe
      const { data: existingData, error: fetchError } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error al buscar la medida:', fetchError);
        return false;
      }

      console.log('Medida encontrada:', existingData);

      // Intentar eliminar
      const { data, error } = await supabase
        .from('body_measurements')
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
        .from('body_measurements')
        .select('*')
        .eq('id', id)
        .single();

      if (verifyError) {
        console.log('La medida ya no existe (éxito)');
      } else {
        console.log('La medida aún existe después de la eliminación:', verifyData);
      }

      return true;
    } catch (err) {
      console.error('Error al eliminar medida:', err);
      return false;
    }
  };

  return {
    loading,
    error,
    getAllBodyMeasurements,
    getBodyMeasurementsByClient,
    getBodyMeasurementById,
    addBodyMeasurement,
    updateBodyMeasurement,
    deleteBodyMeasurement
  };
}; 