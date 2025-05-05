
import { Food } from "@/types";

export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const calculateMealTotals = (foods: any[], getFoodById: (id: string) => Food | null) => {
  return foods.reduce((acc, foodItem) => {
    const food = getFoodById(foodItem.foodId);
    if (food) {
      const multiplier = foodItem.quantity || 1;
      acc.calories += (food.calories * multiplier);
      acc.protein += (food.protein * multiplier);
      acc.carbs += (food.carbs * multiplier);
      acc.fat += (food.fat * multiplier);
    }
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
};
