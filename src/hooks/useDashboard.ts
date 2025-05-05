import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface DashboardData {
  clients: {
    total: number;
    newThisMonth: number;
    withActivePlan: number;
    byGoal: Array<{ name: string; value: number }>;
    recentClients: Array<{
      id: string;
      name: string;
      email: string;
      createdAt: string;
    }>;
  };
  plans: {
    training: {
      total: number;
      active: number;
    };
    nutrition: {
      total: number;
      active: number;
    };
    completionRate: number;
    byType: Array<{ name: string; value: number }>;
    byStatus: Array<{ name: string; value: number }>;
  };
  sessions: {
    total: number;
    averageDuration: number;
    attendanceRate: number;
    byDay: Array<{ name: string; value: number }>;
  };
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    clients: {
      total: 0,
      newThisMonth: 0,
      withActivePlan: 0,
      byGoal: [],
      recentClients: []
    },
    plans: {
      training: {
        total: 0,
        active: 0
      },
      nutrition: {
        total: 0,
        active: 0
      },
      completionRate: 0,
      byType: [],
      byStatus: []
    },
    sessions: {
      total: 0,
      averageDuration: 0,
      attendanceRate: 0,
      byDay: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchDashboardData = async () => {
    try {
      console.log('Iniciando carga de datos del dashboard...');
      setLoading(true);
      setError(null);

      // Obtener perfiles de clientes
      console.log('Consultando perfiles de clientes...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error al obtener perfiles:', profilesError);
        throw profilesError;
      }
      console.log('Perfiles obtenidos:', profilesData);

      // Obtener clientes
      console.log('Consultando clientes...');
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select(`
          id,
          profile_id,
          created_at,
          weight_goal,
          target_weight,
          profiles (
            name,
            email
          )
        `);

      if (clientsError) {
        console.error('Error al obtener clientes:', clientsError);
        throw clientsError;
      }
      console.log('Clientes obtenidos:', clientsData);

      // Obtener planes nutricionales
      console.log('Consultando planes nutricionales...');
      const { data: nutritionPlansData, error: nutritionPlansError } = await supabase
        .from('nutrition_plans')
        .select('*');

      if (nutritionPlansError) {
        console.error('Error al obtener planes nutricionales:', nutritionPlansError);
        throw nutritionPlansError;
      }
      console.log('Planes nutricionales obtenidos:', nutritionPlansData);

      // Obtener planes de entrenamiento
      console.log('Consultando planes de entrenamiento...');
      const { data: trainingPlansData, error: trainingPlansError } = await supabase
        .from('training_plans')
        .select('*');

      if (trainingPlansError) {
        console.error('Error al obtener planes de entrenamiento:', trainingPlansError);
        throw trainingPlansError;
      }
      console.log('Planes de entrenamiento obtenidos:', trainingPlansData);

      // Obtener sesiones
      console.log('Consultando sesiones...');
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('nutrition_sessions')
        .select('*');

      if (sessionsError) {
        console.error('Error al obtener sesiones:', sessionsError);
        throw sessionsError;
      }
      console.log('Sesiones obtenidas:', sessionsData);

      // Filtrar datos por mes actual
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      console.log('Filtrando datos para el mes:', currentMonth + 1, 'del año', currentYear);

      const filterByCurrentMonth = (date: string) => {
        const d = new Date(date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      };

      // Procesar datos de clientes
      const filteredClients = clientsData.filter(client => filterByCurrentMonth(client.created_at));
      console.log('Clientes filtrados del mes actual:', filteredClients);
      
      // Procesar datos de planes
      const filteredNutritionPlans = nutritionPlansData.filter(plan => filterByCurrentMonth(plan.start_date));
      const filteredTrainingPlans = trainingPlansData.filter(plan => filterByCurrentMonth(plan.start_date));
      console.log('Planes nutricionales filtrados:', filteredNutritionPlans);
      console.log('Planes de entrenamiento filtrados:', filteredTrainingPlans);

      // Procesar datos de sesiones
      const filteredSessions = sessionsData.filter(session => filterByCurrentMonth(session.start_date_time));
      const sessionsByDay = filteredSessions.reduce((acc, session) => {
        const date = new Date(session.start_date_time).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Sesiones filtradas:', filteredSessions);
      console.log('Sesiones por día:', sessionsByDay);

      // Calcular métricas de planes
      const activeNutritionPlans = filteredNutritionPlans.filter(plan => plan.status === 'active').length;
      const activeTrainingPlans = filteredTrainingPlans.filter(plan => plan.status === 'active').length;
      const completedPlans = filteredNutritionPlans.filter(plan => plan.status === 'completed').length + 
                           filteredTrainingPlans.filter(plan => plan.status === 'completed').length;
      const totalPlans = filteredNutritionPlans.length + filteredTrainingPlans.length;

      // Calcular distribución de objetivos
      const goalsDistribution = clientsData.reduce((acc, client) => {
        const goal = client.weight_goal || 'sin_objetivo';
        acc[goal] = (acc[goal] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Procesar clientes recientes
      const recentClients = profilesData
        .slice(0, 5)
        .map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          createdAt: profile.created_at
        }));

      // Actualizar estado con los datos procesados
      const processedData = {
        clients: {
          total: clientsData.length,
          newThisMonth: filteredClients.length,
          withActivePlan: clientsData.filter(client => {
            const hasNutritionPlan = filteredNutritionPlans.some(plan => plan.client_id === client.id && plan.status === 'active');
            const hasTrainingPlan = filteredTrainingPlans.some(plan => plan.client_id === client.id && plan.status === 'active');
            return hasNutritionPlan || hasTrainingPlan;
          }).length,
          byGoal: Object.entries(goalsDistribution).map(([goal, count]) => ({
            name: goal === 'lose' ? 'Perder peso' : 
                  goal === 'maintain' ? 'Mantener peso' : 
                  goal === 'gain' ? 'Aumentar peso' : 'Sin objetivo',
            value: count
          })),
          recentClients
        },
        plans: {
          training: {
            total: filteredTrainingPlans.length,
            active: activeTrainingPlans
          },
          nutrition: {
            total: filteredNutritionPlans.length,
            active: activeNutritionPlans
          },
          completionRate: totalPlans > 0 ? completedPlans / totalPlans : 0,
          byType: [
            { name: "Planes Nutricionales", value: filteredNutritionPlans.length },
            { name: "Planes de Entrenamiento", value: filteredTrainingPlans.length }
          ],
          byStatus: [
            { name: "Activos", value: activeNutritionPlans + activeTrainingPlans },
            { name: "Completados", value: completedPlans },
            { name: "Pendientes", value: totalPlans - (activeNutritionPlans + activeTrainingPlans + completedPlans) }
          ]
        },
        sessions: {
          total: filteredSessions.length,
          averageDuration: 60, // Valor por defecto
          attendanceRate: filteredSessions.length > 0 
            ? filteredSessions.filter(s => s.status === "completada").length / filteredSessions.length
            : 0,
          byDay: Object.entries(sessionsByDay).map(([date, count]) => ({ 
            name: date, 
            value: count as number 
          }))
        }
      };

      console.log('Datos procesados para el dashboard:', processedData);
      setData(processedData);

    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      console.log('Usuario actual detectado, iniciando carga de datos...', currentUser);
      fetchDashboardData();
    } else {
      console.log('No hay usuario actual, no se cargarán los datos');
    }
  }, [currentUser]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
} 