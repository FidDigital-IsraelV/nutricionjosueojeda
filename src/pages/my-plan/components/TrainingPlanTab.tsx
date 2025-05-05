
import React from "react";
import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrainingPlanView } from "@/components/training/TrainingPlanView";
import { TrainingPlan } from "@/types";

interface TrainingPlanTabProps {
  activeTrainingPlan: TrainingPlan | undefined;
}

const TrainingPlanTab: React.FC<TrainingPlanTabProps> = ({ activeTrainingPlan }) => {
  if (!activeTrainingPlan) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No tienes un plan de entrenamiento activo</h3>
          <p className="text-muted-foreground mb-4">
            Tu entrenador aún no ha creado un plan de entrenamiento para ti.
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

  return <TrainingPlanView planId={activeTrainingPlan.id} />;
};

export default TrainingPlanTab;
