import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Meal } from '@/types';

export const useMeals = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const { data, error } = await supabase
          .from('meals')
          .select('*');

        if (error) throw error;

        setMeals(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las comidas');
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  return { meals, loading, error };
}; 