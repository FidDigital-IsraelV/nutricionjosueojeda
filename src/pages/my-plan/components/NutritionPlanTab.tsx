import React from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Info, DropletIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NutritionPlan, Food, Supplement } from "@/types";

interface NutritionPlanTabProps {
  activeNutritionPlan: NutritionPlan | undefined;
  formatDate: (dateString: string | undefined) => string;
  calculateMealTotals: (foods: any[]) => { calories: number; protein: number; carbs: number; fat: number; };
  getFoodById: (foodId: string) => Food | null;
  getSupplementById: (id: string) => Supplement | undefined;
}

const NutritionPlanTab: React.FC<NutritionPlanTabProps> = ({ 
  activeNutritionPlan,
  formatDate,
  calculateMealTotals,
  getFoodById,
  getSupplementById
}) => {
  if (!activeNutritionPlan) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No tienes un plan nutricional activo</h3>
          <p className="text-muted-foreground mb-4">
            Tu nutricionista aún no ha creado un plan nutricional para ti.
          </p>
          <Button asChild>
            <Link to="/sesiones-nutricion/crear">
              Solicitar Sesión
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{activeNutritionPlan.title}</CardTitle>
              <CardDescription className="mt-1">
                Creado: {formatDate(activeNutritionPlan.startDate)}
                {activeNutritionPlan.endDate && ` • Finaliza: ${formatDate(activeNutritionPlan.endDate)}`}
              </CardDescription>
            </div>
            <Badge className="bg-green-500">Activo</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium text-lg flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" /> Descripción
            </h3>
            <p className="text-muted-foreground">
              {activeNutritionPlan.description || "Sin descripción disponible."}
            </p>
          </div>
          
          {activeNutritionPlan.nutrientGoals && (
            <NutrientGoalsSection nutrientGoals={activeNutritionPlan.nutrientGoals} />
          )}

          {activeNutritionPlan.hydration && (
            <HydrationSection hydration={activeNutritionPlan.hydration} />
          )}
          
          <DietaryRestrictionsSection 
            restrictions={activeNutritionPlan.restrictions} 
            allergies={activeNutritionPlan.allergies} 
          />
          
          {activeNutritionPlan.dailyPlans && activeNutritionPlan.dailyPlans.length > 0 ? (
            <div className="space-y-6">
              {activeNutritionPlan.dailyPlans.map((dailyPlan, dayIndex) => (
                <DailyPlanCard 
                  key={dayIndex} 
                  dailyPlan={dailyPlan} 
                  dayIndex={dayIndex}
                  calculateMealTotals={calculateMealTotals}
                  getFoodById={getFoodById}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Tu plan nutricional no tiene comidas diarias asignadas.
                </p>
                <p className="mt-2">
                  Contacta a tu nutricionista para actualizar tu plan.
                </p>
              </CardContent>
            </Card>
          )}
          
          {activeNutritionPlan.supplements && Object.keys(activeNutritionPlan.supplements).length > 0 && (
            <SupplementsSection 
              supplements={activeNutritionPlan.supplements}
              getSupplementById={getSupplementById}
            />
          )}

          {activeNutritionPlan.additionalNotes && (
            <AdditionalNotesSection notes={activeNutritionPlan.additionalNotes} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const NutrientGoalsSection = ({ nutrientGoals }) => (
  <div>
    <h3 className="font-medium text-lg mb-3">Objetivos Nutricionales</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {nutrientGoals.calories && (
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Calorías</span>
            <span className="text-xl font-bold">
              {nutrientGoals.calories} kcal
            </span>
          </CardContent>
        </Card>
      )}
      {nutrientGoals.protein && (
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Proteína</span>
            <span className="text-xl font-bold">
              {nutrientGoals.protein}g
            </span>
          </CardContent>
        </Card>
      )}
      {nutrientGoals.carbs && (
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Carbohidratos</span>
            <span className="text-xl font-bold">
              {nutrientGoals.carbs}g
            </span>
          </CardContent>
        </Card>
      )}
      {nutrientGoals.fat && (
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Grasas</span>
            <span className="text-xl font-bold">
              {nutrientGoals.fat}g
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
);

const HydrationSection = ({ hydration }) => (
  <div>
    <h3 className="font-medium text-lg flex items-center gap-2 mb-3">
      <DropletIcon className="h-4 w-4" /> Hidratación
    </h3>
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-medium">
              {hydration.waterLiters} litros diarios
            </span>
            {hydration.notes && (
              <p className="text-sm text-muted-foreground mt-1">
                {hydration.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const DietaryRestrictionsSection = ({ restrictions, allergies }) => (
  <div className="grid md:grid-cols-2 gap-6">
    {restrictions && restrictions.length > 0 && (
      <div>
        <h3 className="font-medium mb-2">Restricciones</h3>
        <div className="flex flex-wrap gap-2">
          {restrictions.map((restriction, i) => (
            <Badge key={i} variant="outline">{restriction}</Badge>
          ))}
        </div>
      </div>
    )}
    
    {allergies && allergies.length > 0 && (
      <div>
        <h3 className="font-medium mb-2">Alergias</h3>
        <div className="flex flex-wrap gap-2">
          {allergies.map((allergy, i) => (
            <Badge key={i} variant="outline">{allergy}</Badge>
          ))}
        </div>
      </div>
    )}
  </div>
);

const DailyPlanCard = ({ dailyPlan, dayIndex, calculateMealTotals, getFoodById }) => (
  <Card key={dayIndex} className="overflow-hidden">
    <CardHeader className="bg-muted">
      <CardTitle className="text-xl">Día {dailyPlan.day || dayIndex + 1}</CardTitle>
      <CardDescription>
        Calorías totales: {dailyPlan.totalCalories || "N/A"} kcal • 
        Proteínas: {dailyPlan.totalProtein || "N/A"}g • 
        Carbohidratos: {dailyPlan.totalCarbs || "N/A"}g • 
        Grasas: {dailyPlan.totalFat || "N/A"}g
      </CardDescription>
    </CardHeader>
    <CardContent className="p-4">
      <div className="space-y-6">
        {dailyPlan.meals.map((meal, mealIndex) => {
          const mealTotals = calculateMealTotals(meal.foods || []);
          
          return (
            <div key={mealIndex} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-lg">
                  {meal.type === "breakfast" ? "Desayuno" : 
                   meal.type === "lunch" ? "Almuerzo" : 
                   meal.type === "dinner" ? "Cena" : "Merienda"}
                  {meal.name && ` - ${meal.name}`}
                </h4>
                <div className="text-sm text-muted-foreground">
                  {mealTotals.calories.toFixed(0)} kcal
                </div>
              </div>
              
              {meal.foods && meal.foods.length > 0 ? (
                <div className="space-y-3">
                  {meal.foods.map((foodItem, foodIndex) => {
                    const food = getFoodById(foodItem.foodId);
                    if (!food) return null;
                    
                    return (
                      <div key={foodIndex} className="flex items-center gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                        {food.image && (
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={food.image} 
                              alt={food.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {foodItem.quantity || 1} {food.servingUnit || "porción"}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {(food.calories * (foodItem.quantity || 1)).toFixed(0)} kcal
                          </div>
                          <div className="text-muted-foreground">
                            P: {(food.protein * (foodItem.quantity || 1)).toFixed(1)}g • 
                            C: {(food.carbs * (foodItem.quantity || 1)).toFixed(1)}g • 
                            G: {(food.fat * (foodItem.quantity || 1)).toFixed(1)}g
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay alimentos asignados para esta comida.</p>
              )}
              
              {meal.instructions && (
                <div className="mt-3 pt-3 border-t">
                  <h5 className="font-medium text-sm mb-1">Instrucciones:</h5>
                  <p className="text-sm text-muted-foreground">{meal.instructions}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

const SupplementsSection = ({ supplements, getSupplementById }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suplementos Recomendados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {supplements.map((suppl, index) => {
            const supplement = getSupplementById(suppl.supplementId);
            
            return (
              <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <div className="font-medium">
                    {supplement ? supplement.name : "Suplemento no encontrado"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dosificación: {suppl.dosage}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const AdditionalNotesSection = ({ notes }) => (
  <Card>
    <CardHeader>
      <CardTitle>Notas Adicionales</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{notes}</p>
    </CardContent>
  </Card>
);

export default NutritionPlanTab;
