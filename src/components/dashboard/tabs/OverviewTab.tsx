
import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import AchievementCard from "@/components/dashboard/AchievementCard";
import WeightProgressChart from "../charts/WeightProgressChart";
import { Achievement, Client, NutritionPlan, ProgressRecord } from "@/types";

interface OverviewTabProps {
  client: Client;
  clientProgressRecords: ProgressRecord[];
  clientAchievements: Achievement[];
  clientPlans: NutritionPlan[];
  latestWeight: number;
  weightDifference: number;
  weightTrend: "up" | "down" | "neutral";
  clientWeightProgressData: Array<{ date: string; weight: number }>;
}

const OverviewTab = ({
  client,
  clientProgressRecords,
  clientAchievements,
  clientPlans,
  latestWeight,
  weightDifference,
  weightTrend,
  clientWeightProgressData,
}: OverviewTabProps) => {
  const activePlan = clientPlans.find(plan => plan.isActive);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Peso Actual"
          value={`${latestWeight || "N/A"} kg`}
          description={client?.goals.targetWeight ? `Meta: ${client.goals.targetWeight} kg` : ""}
          icon={TrendingUp}
          trend={weightTrend}
          trendValue={weightDifference ? `${Math.abs(weightDifference).toFixed(1)} kg` : ""}
        />
        <StatCard
          title="Plan Activo"
          value={activePlan ? "Sí" : "No"}
          description={activePlan?.title || "Sin plan activo"}
          icon={Calendar}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-plan">Ver Plan</Link>
            </Button>
          }
        />
        <StatCard
          title="Logros"
          value={clientAchievements.length}
          description="Insignias ganadas"
          icon={Award}
        />
      </div>

      <WeightProgressChart 
        data={clientWeightProgressData}
        targetWeight={client?.goals.targetWeight}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Logros Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientAchievements.length > 0 ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {clientAchievements.slice(0, 3).map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                    isNew={achievement.id === clientAchievements[0].id}
                  />
                ))}
              </div>
              
              {clientAchievements.length > 3 && (
                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <Link to="/achievements">Ver Todos los Logros</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Aún no has ganado ningún logro.
              </p>
              <p>¡Sigue tu plan nutricional para desbloquear logros!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
