import { useState, useCallback } from 'react';
import { Food } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';

export function useFoods() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllFoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('foods')
        .select('*')
        .order('name');

      if (supabaseError) throw supabaseError;

      const formattedData = data.map(food => ({
        ...food,
        calories: Number(food.calories),
        protein: Number(food.protein),
        carbs: Number(food.carbs),
        fat: Number(food.fat),
        fiber: Number(food.fiber || 0),
        sugar: Number(food.sugar || 0),
        sodium: Number(food.sodium || 0),
        servingSize: Number(food.serving_size),
        servingUnit: food.serving_unit,
        ingredients: food.ingredients ? Object.entries(food.ingredients).map(([name, amount]) => ({
          name,
          amount: amount as string
        })) : [],
        preparations: food.preparations ? Object.entries(food.preparations).map(([_, step]) => ({
          step: step as string
        })) : []
      }));

      return formattedData as Food[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los alimentos');
      toast.error('Error al cargar los alimentos');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getFoodById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('foods')
        .select('*')
        .eq('id', id)
        .single();

      if (supabaseError) throw supabaseError;

      return data as Food;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el alimento');
      toast.error('Error al cargar el alimento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addFood = useCallback(async (food: Omit<Food, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('foods')
        .insert({
          name: food.name,
          category: food.category,
          calories: food.calories.toString(),
          protein: food.protein.toString(),
          carbs: food.carbs.toString(),
          fat: food.fat.toString(),
          fiber: food.fiber?.toString() || "0",
          sugar: food.sugar?.toString() || "0",
          sodium: food.sodium?.toString() || "0",
          serving_size: food.servingSize.toString(),
          serving_unit: food.servingUnit,
          image_url: food.image_url,
          description: food.description || "",
          ingredients: food.ingredients?.reduce((acc, curr) => {
            acc[curr.name] = curr.amount;
            return acc;
          }, {} as Record<string, string>) || {},
          preparations: food.preparations?.reduce((acc, curr, index) => {
            acc[`paso${index + 1}`] = curr.step;
            return acc;
          }, {} as Record<string, string>) || {},
          restrictions: food.restrictions || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      toast.success('Alimento creado exitosamente');
      return data as Food;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el alimento');
      toast.error('Error al crear el alimento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFood = useCallback(async (id: string, food: Partial<Food>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('foods')
        .update({
          name: food.name,
          category: food.category,
          calories: food.calories?.toString(),
          protein: food.protein?.toString(),
          carbs: food.carbs?.toString(),
          fat: food.fat?.toString(),
          fiber: food.fiber?.toString(),
          sugar: food.sugar?.toString(),
          sodium: food.sodium?.toString(),
          serving_size: food.servingSize?.toString(),
          serving_unit: food.servingUnit,
          image_url: food.image_url,
          description: food.description,
          ingredients: food.ingredients?.reduce((acc, curr) => {
            acc[curr.name] = curr.amount;
            return acc;
          }, {} as Record<string, string>),
          preparations: food.preparations?.reduce((acc, curr, index) => {
            acc[`paso${index + 1}`] = curr.step;
            return acc;
          }, {} as Record<string, string>),
          restrictions: food.restrictions,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      toast.success('Alimento actualizado exitosamente');
      return data as Food;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el alimento');
      toast.error('Error al actualizar el alimento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFood = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: supabaseError } = await supabase
        .from('foods')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      toast.success('Alimento eliminado exitosamente');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el alimento');
      toast.error('Error al eliminar el alimento');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAllFoods,
    getFoodById,
    addFood,
    updateFood,
    deleteFood
  };
} 