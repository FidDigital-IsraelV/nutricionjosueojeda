import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TrainingPlan {
  id: string;
  client_id: string;
  trainer_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'draft';
  routines: Array<{
    id: string;
    day: string;
    exercises: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface ClientProfile {
  name: string;
}

interface Client {
  id: string;
  profile_id: string;
  profiles: ClientProfile;
}

export function useTrainingPlans() {
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainingPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Iniciando carga de planes...');

      const { data: plans, error: plansError } = await supabase
        .from('training_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;
      console.log('Planes de entrenamiento cargados:', plans);

      // Primero obtenemos los clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select(`
          id,
          profile_id
        `);

      if (clientsError) throw clientsError;
      console.log('Datos de clientes cargados:', clientsData);

      // Luego obtenemos los perfiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;
      console.log('Datos de perfiles cargados:', profilesData);

      // Mapear los datos de clientes al formato correcto
      const formattedClients = (clientsData || []).map(client => {
        const profile = profilesData?.find(p => p.id === client.profile_id);
        console.log('Mapeando cliente:', client, 'con perfil:', profile);
        return {
          id: client.id,
          profile_id: client.profile_id,
          profiles: {
            name: profile?.name || ''
          }
        };
      });

      console.log('Clientes formateados:', formattedClients);
      console.log('Estableciendo planes y clientes en el estado...');
      setTrainingPlans(plans || []);
      setClients(formattedClients);
      console.log('Estado actualizado correctamente');
    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los planes');
    } finally {
      console.log('Finalizando carga de datos');
      setLoading(false);
    }
  };

  const deleteTrainingPlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('training_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTrainingPlans(prev => prev.filter(plan => plan.id !== id));
      return true;
    } catch (err) {
      console.error('Error al eliminar el plan:', err);
      return false;
    }
  };

  const updateTrainingPlan = async (plan: TrainingPlan) => {
    try {
      const { error } = await supabase
        .from('training_plans')
        .update({
          title: plan.title,
          description: plan.description,
          start_date: plan.start_date,
          end_date: plan.end_date,
          status: plan.status,
          routines: plan.routines,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);

      if (error) throw error;
      setTrainingPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
      return true;
    } catch (err) {
      console.error('Error al actualizar el plan:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchTrainingPlans();
  }, []);

  return {
    trainingPlans,
    clients,
    loading,
    error,
    fetchTrainingPlans,
    deleteTrainingPlan,
    updateTrainingPlan
  };
} 