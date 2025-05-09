import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Dumbbell, Utensils, Target } from "lucide-react";
import { useReports } from "@/hooks/useReports";

interface ReportePlanesProps {
  month: string;
  year: string;
}

const ReportePlanes: React.FC<ReportePlanesProps> = ({ month, year }) => {
  const { data, loading, error } = useReports(month, year);

  if (loading) {
      return (
      <div className="text-center py-4">
        <p>Cargando datos de planes...</p>
      </div>
      );
  }

  if (error) {
      return (
      <div className="text-center py-4 text-red-500">
        <p>Error al cargar los datos: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes de Entrenamiento</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.plans.training.total}</div>
            <p className="text-xs text-muted-foreground">
              {data.plans.training.active} activos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes de Nutrición</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.plans.nutrition.total}</div>
            <p className="text-xs text-muted-foreground">
              {data.plans.nutrition.active} activos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completitud</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((data.plans.completionRate) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Planes completados
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Planes por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="aspect-auto h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.plans.byType}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent className="bg-background" />
                    }
                  />
                  <Bar 
                    dataKey="value" 
                    name="type" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Planes por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="aspect-auto h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.plans.byStatus}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent className="bg-background" />
                    }
                  />
                  <Bar 
                    dataKey="value" 
                    name="status" 
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportePlanes;
