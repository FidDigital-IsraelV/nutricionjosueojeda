import { useState, useCallback } from 'react';
import { NutritionPlan } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';

export function useNutritionPlans() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformDailyPlans = (dailyPlans: any) => {
    if (!dailyPlans) return [];
    
    // Si dailyPlans es un array, lo devolvemos tal cual
    if (Array.isArray(dailyPlans)) return dailyPlans;
    
    // Si es un objeto, lo convertimos a array
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.map((day, index) => {
      const dayData = dailyPlans[day] || {};
      return {
        day: index + 1,
        meals: Object.entries(dayData).map(([type, meal]: [string, any]) => ({
          type,
          time: meal.time || "12:00",
          meal_id: meal.meal_id || ""
        })),
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      };
    });
  };

  const getAllNutritionPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('Error en la consulta:', supabaseError);
        throw supabaseError;
      }

      // Transformar los datos para que coincidan con el tipo NutritionPlan
      const transformedData = data.map(plan => ({
        id: plan.id,
        clientId: plan.client_id,
        nutritionistId: plan.nutritionist_id,
        title: plan.title,
        startDate: plan.start_date,
        endDate: plan.end_date,
        dailyPlans: transformDailyPlans(plan.daily_plans),
        notes: plan.notes,
        isActive: plan.is_active,
        nutrientGoals: plan.nutrient_goals,
        hydration: plan.hydration,
        restrictions: plan.restrictions,
        preferences: plan.preferences,
        allergies: plan.allergies,
        objectives: plan.objectives,
        additionalNotes: plan.additional_notes,
        description: plan.description,
        supplements: plan.supplements
      }));

      return transformedData as NutritionPlan[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los planes nutricionales';
      console.error('Error detallado:', err);
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getNutritionPlanById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (supabaseError) {
        console.error('Error en la consulta:', supabaseError);
        throw supabaseError;
      }

      if (!data) return null;

      // Transformar los datos para que coincidan con el tipo NutritionPlan
      const transformedData = {
        id: data.id,
        clientId: data.client_id,
        nutritionistId: data.nutritionist_id,
        title: data.title,
        startDate: data.start_date,
        endDate: data.end_date,
        dailyPlans: transformDailyPlans(data.daily_plans),
        notes: data.notes,
        isActive: data.is_active,
        nutrientGoals: data.nutrient_goals,
        hydration: data.hydration,
        restrictions: data.restrictions,
        preferences: data.preferences,
        allergies: data.allergies,
        objectives: data.objectives,
        additionalNotes: data.additional_notes,
        description: data.description,
        supplements: data.supplements
      };

      return transformedData as NutritionPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el plan nutricional';
      console.error('Error detallado:', err);
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addNutritionPlan = useCallback(async (plan: Omit<NutritionPlan, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      // Obtener el ID del nutricionista
      const { data: nutritionistData, error: nutritionistError } = await supabase
        .from('nutritionists')
        .select('id')
        .eq('profile_id', plan.nutritionistId)
        .single();

      if (nutritionistError) throw nutritionistError;
      if (!nutritionistData) throw new Error('No se encontró el nutricionista');

      const planData = {
        client_id: plan.clientId,
        nutritionist_id: nutritionistData.id,
        title: plan.title,
        start_date: plan.startDate,
        end_date: plan.endDate,
        daily_plans: plan.dailyPlans,
        notes: plan.notes,
        is_active: plan.isActive,
        nutrient_goals: plan.nutrientGoals,
        hydration: plan.hydration,
        restrictions: plan.restrictions,
        preferences: plan.preferences,
        allergies: plan.allergies,
        objectives: plan.objectives,
        additional_notes: plan.additionalNotes,
        description: plan.description,
        supplements: plan.supplements,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: supabaseError } = await supabase
        .from('nutrition_plans')
        .insert(planData)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Transformar los datos devueltos
      const transformedData = {
        id: data.id,
        clientId: data.client_id,
        nutritionistId: data.nutritionist_id,
        title: data.title,
        startDate: data.start_date,
        endDate: data.end_date,
        dailyPlans: data.daily_plans,
        notes: data.notes,
        isActive: data.is_active,
        nutrientGoals: data.nutrient_goals,
        hydration: data.hydration,
        restrictions: data.restrictions,
        preferences: data.preferences,
        allergies: data.allergies,
        objectives: data.objectives,
        additionalNotes: data.additional_notes,
        description: data.description,
        supplements: data.supplements
      };

      toast.success('Plan nutricional creado exitosamente');
      return transformedData as NutritionPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el plan nutricional');
      toast.error('Error al crear el plan nutricional');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNutritionPlan = useCallback(async (id: string, plan: Partial<NutritionPlan>) => {
    try {
      setLoading(true);
      setError(null);

      // Obtener el ID del nutricionista
      const { data: nutritionistData, error: nutritionistError } = await supabase
        .from('nutritionists')
        .select('id')
        .eq('profile_id', plan.nutritionistId)
        .single();

      if (nutritionistError) throw nutritionistError;
      if (!nutritionistData) throw new Error('No se encontró el nutricionista');

      const planData = {
        client_id: plan.clientId,
        nutritionist_id: nutritionistData.id,
        title: plan.title,
        start_date: plan.startDate,
        end_date: plan.endDate,
        daily_plans: plan.dailyPlans,
        notes: plan.notes,
        is_active: plan.isActive,
        nutrient_goals: plan.nutrientGoals,
        hydration: plan.hydration,
        restrictions: plan.restrictions,
        preferences: plan.preferences,
        allergies: plan.allergies,
        objectives: plan.objectives,
        additional_notes: plan.additionalNotes,
        description: plan.description,
        supplements: plan.supplements,
        updated_at: new Date().toISOString()
      };

      const { data, error: supabaseError } = await supabase
        .from('nutrition_plans')
        .update(planData)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Transformar los datos devueltos
      const transformedData = {
        id: data.id,
        clientId: data.client_id,
        nutritionistId: data.nutritionist_id,
        title: data.title,
        startDate: data.start_date,
        endDate: data.end_date,
        dailyPlans: data.daily_plans,
        notes: data.notes,
        isActive: data.is_active,
        nutrientGoals: data.nutrient_goals,
        hydration: data.hydration,
        restrictions: data.restrictions,
        preferences: data.preferences,
        allergies: data.allergies,
        objectives: data.objectives,
        additionalNotes: data.additional_notes,
        description: data.description,
        supplements: data.supplements
      };

      toast.success('Plan nutricional actualizado exitosamente');
      return transformedData as NutritionPlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el plan nutricional');
      toast.error('Error al actualizar el plan nutricional');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNutritionPlan = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: supabaseError } = await supabase
        .from('nutrition_plans')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      toast.success('Plan nutricional eliminado exitosamente');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el plan nutricional');
      toast.error('Error al eliminar el plan nutricional');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAllNutritionPlans,
    getNutritionPlanById,
    addNutritionPlan,
    updateNutritionPlan,
    deleteNutritionPlan
  };
} 