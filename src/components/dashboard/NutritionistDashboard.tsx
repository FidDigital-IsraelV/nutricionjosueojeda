import React from "react";
import { Link } from "react-router-dom";
import { Users, Calendar, Activity, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import ClientList from "@/components/dashboard/ClientList";
import { Client, NutritionFollowUp, NutritionPlan, ProgressRecord } from "@/types";
import ClientWeightDistributionChart from "./charts/ClientWeightDistributionChart";
import ClientGoalDistributionChart from "./charts/ClientGoalDistributionChart";
import ClientsOverTimeChart from "./charts/ClientsOverTimeChart";
import { useDashboard } from "@/hooks/useDashboard";

interface NutritionistDashboardProps {
  nutritionistId: string;
  clients: Client[];
  clientFollowUps: NutritionFollowUp[];
  clientPlans: NutritionPlan[];
  clientAchievements: any[];
  getProgressRecordsByClient: (clientId: string) => ProgressRecord[];
}

const NutritionistDashboard = ({
  nutritionistId,
  clients,
  clientFollowUps,
  clientPlans,
  clientAchievements,
  getProgressRecordsByClient
}: NutritionistDashboardProps) => {
  const { data, loading, error } = useDashboard();

  console.log('Estado del dashboard:', { data, loading, error });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando datos del dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error al cargar los datos: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Clientes"
          value={data.clients.total}
          description="Pacientes activos"
          icon={Users}
        />
        <StatCard
          title="Planes Activos"
          value={data.plans.nutrition.active + data.plans.training.active}
          description="Planes activos"
          icon={Calendar}
        />
        <StatCard
          title="Seguimientos"
          value={data.sessions.total}
          description="Sesiones realizadas"
          icon={Activity}
        />
        <StatCard
          title="Tasa de Asistencia"
          value={`${(data.sessions.attendanceRate * 100).toFixed(1)}%`}
          description="Sesiones completadas"
          icon={Award}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.clients.byGoal.length > 0 && (
          <ClientGoalDistributionChart data={data.clients.byGoal} />
        )}
        
        {data.plans.byType.length > 0 && (
          <ClientWeightDistributionChart data={data.plans.byType} />
        )}
        
        {data.sessions.byDay.length > 0 && (
          <ClientsOverTimeChart data={data.sessions.byDay} />
        )}
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes Recientes
            </h3>
          </div>
          <div className="card-content h-80 overflow-auto">
            {data.clients.recentClients.length > 0 ? (
              <div className="space-y-4">
                <ClientList 
                  clients={data.clients.recentClients.map(client => ({
                    id: client.id,
                    name: client.name,
                    email: client.email,
                    createdAt: client.createdAt
                  }))}
                />
                <div className="pt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/clientes">Ver todos los clientes</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">No hay clientes registrados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionistDashboard;
