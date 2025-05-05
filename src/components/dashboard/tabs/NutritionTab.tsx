
import React from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Dumbbell, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import { NutritionPlan } from "@/types";

interface NutritionTabProps {
  activePlan: NutritionPlan | undefined;
  clientPlans: NutritionPlan[];
  hasTrainingPlans: boolean;
}

const NutritionTab = ({ activePlan, clientPlans, hasTrainingPlans }: NutritionTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Plan Nutricional"
          value={activePlan ? "Activo" : "No asignado"}
          description={activePlan?.title || "Sin plan nutricional asignado"}
          icon={UtensilsCrossed}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-plan">Ver Plan</Link>
            </Button>
          }
        />
        <StatCard
          title="Plan de Entrenamiento"
          value={hasTrainingPlans ? "Activo" : "No asignado"}
          description="Plan personalizado"
          icon={Dumbbell}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-plan?tab=training">Ver Plan</Link>
            </Button>
          }
        />
        <StatCard
          title="Próxima Sesión"
          value="No programada"
          description="Contacta a tu nutricionista"
          icon={Calendar}
        />
      </div>
      
      {activePlan ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mi Plan Nutricional</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/my-plan">Ver Plan Completo</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Descripción del Plan</h3>
              <p className="text-muted-foreground">{activePlan.description || "Sin descripción disponible."}</p>
            </div>
            
            {activePlan.dailyPlans && activePlan.dailyPlans.length > 0 ? (
              <div>
                <h3 className="font-medium mb-4">Comidas del Día</h3>
                {activePlan.dailyPlans[0].meals.map((meal, index) => (
                  <div key={index} className="mb-3 p-3 border rounded-md">
                    <h4 className="font-medium text-base">{meal.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {meal.foods && meal.foods.length > 0 
                        ? meal.foods.map(f => f.foodId).join(", ")
                        : "Sin alimentos asignados"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Este plan no tiene comidas diarias asignadas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  );
};

export default NutritionTab;
