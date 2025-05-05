
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Meal, Food } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Utensils } from "lucide-react";

interface MealCardProps {
  meal: Meal;
  foods: Food[];
}

const MealCard = ({ meal, foods }: MealCardProps) => {
  // Calculate nutrients
  const getTotalNutrients = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    meal.foods.forEach((mealFood) => {
      const food = foods.find((f) => f.id === mealFood.foodId);
      if (food) {
        const factor = mealFood.quantity / food.servingSize;
        totalCalories += food.calories * factor;
        totalProtein += food.protein * factor;
        totalCarbs += food.carbs * factor;
        totalFat += food.fat * factor;
      }
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
    };
  };

  const nutrients = getTotalNutrients();

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case "breakfast":
        return "Desayuno";
      case "lunch":
        return "Almuerzo";
      case "dinner":
        return "Cena";
      case "snack":
        return "Snack";
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{meal.name}</CardTitle>
            <CardDescription>
              {getMealTypeLabel(meal.type)}
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center">
            <Utensils className="h-3 w-3 mr-1" />
            {nutrients.calories} kcal
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Alimentos:</h4>
            <ul className="space-y-1">
              {meal.foods.map((mealFood) => {
                const food = foods.find((f) => f.id === mealFood.foodId);
                return (
                  <li key={mealFood.foodId} className="text-sm flex justify-between">
                    <span>{food?.name || "Alimento desconocido"}</span>
                    <span className="text-muted-foreground">
                      {mealFood.quantity} {food?.servingUnit || "g"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Nutrientes:</h4>
            <div className="flex justify-between text-sm">
              <div>
                <p>Proteínas</p>
                <p className="font-medium">{nutrients.protein}g</p>
              </div>
              <div>
                <p>Carbohidratos</p>
                <p className="font-medium">{nutrients.carbs}g</p>
              </div>
              <div>
                <p>Grasas</p>
                <p className="font-medium">{nutrients.fat}g</p>
              </div>
            </div>
          </div>

          {meal.instructions && (
            <div>
              <h4 className="text-sm font-medium mb-1">Instrucciones:</h4>
              <p className="text-sm">{meal.instructions}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MealCard;
