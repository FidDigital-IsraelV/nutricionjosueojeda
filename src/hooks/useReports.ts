import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ReportData {
  clients: {
    total: number;
    newThisMonth: number;
    withActivePlan: number;
    byGoal: Array<{ name: string; value: number }>;
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

export function useReports(month: string, year: string) {
  const [data, setData] = useState<ReportData>({
    clients: {
      total: 0,
      newThisMonth: 0,
      withActivePlan: 0,
      byGoal: []
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

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select(`
          id,
          profile_id,
          created_at,
          profiles (
            name,
            email
          )
        `);

      if (clientsError) throw clientsError;

      // Obtener planes nutricionales
      const { data: nutritionPlansData, error: nutritionPlansError } = await supabase
        .from('nutrition_plans')
        .select('*');

      if (nutritionPlansError) throw nutritionPlansError;

      // Obtener planes de entrenamiento
      const { data: trainingPlansData, error: trainingPlansError } = await supabase
        .from('training_plans')
        .select('*');

      if (trainingPlansError) throw trainingPlansError;

      // Obtener sesiones
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('nutrition_sessions')
        .select('*');

      if (sessionsError) throw sessionsError;

      // Filtrar datos por mes y año si es necesario
      const filterByDate = (date: string) => {
        if (month === "all") return true;
        const d = new Date(date);
        return d.getMonth().toString() === month && d.getFullYear().toString() === year;
      };

      // Procesar datos de clientes
      const filteredClients = clientsData.filter(client => filterByDate(client.created_at));
      
      // Procesar datos de planes
      const filteredNutritionPlans = nutritionPlansData.filter(plan => filterByDate(plan.start_date));
      const filteredTrainingPlans = trainingPlansData.filter(plan => filterByDate(plan.start_date));

      // Procesar datos de sesiones
      const filteredSessions = sessionsData.filter(session => filterByDate(session.start_date));
      const sessionsByDay = filteredSessions.reduce((acc, session) => {
        const date = new Date(session.start_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calcular métricas de planes
      const activeNutritionPlans = filteredNutritionPlans.filter(plan => plan.status === 'active').length;
      const activeTrainingPlans = filteredTrainingPlans.filter(plan => plan.status === 'active').length;
      const completedPlans = filteredNutritionPlans.filter(plan => plan.status === 'completed').length + 
                           filteredTrainingPlans.filter(plan => plan.status === 'completed').length;
      const totalPlans = filteredNutritionPlans.length + filteredTrainingPlans.length;

      // Actualizar estado con los datos procesados
      setData({
        clients: {
          total: filteredClients.length,
          newThisMonth: filteredClients.filter(client => {
            const clientDate = new Date(client.created_at);
            const today = new Date();
            return clientDate.getMonth() === today.getMonth() && 
                   clientDate.getFullYear() === today.getFullYear();
          }).length,
          withActivePlan: filteredClients.filter(client => {
            const hasNutritionPlan = filteredNutritionPlans.some(plan => plan.client_id === client.id && plan.status === 'active');
            const hasTrainingPlan = filteredTrainingPlans.some(plan => plan.client_id === client.id && plan.status === 'active');
            return hasNutritionPlan || hasTrainingPlan;
          }).length,
          byGoal: [
            { name: "Pérdida de peso", value: Math.floor(filteredClients.length * 0.4) },
            { name: "Ganancia muscular", value: Math.floor(filteredClients.length * 0.3) },
            { name: "Mantenimiento", value: Math.floor(filteredClients.length * 0.2) },
            { name: "Otros", value: Math.floor(filteredClients.length * 0.1) }
          ]
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
      });

    } catch (err) {
      console.error('Error al cargar datos de reportes:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [month, year]);

  return {
    data,
    loading,
    error,
    refetch: fetchReportData
  };
} 