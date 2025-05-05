import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Calendar, Clock, Target } from "lucide-react";
import { useReports } from "@/hooks/useReports";

interface ReporteSesionesProps {
  month: string;
  year: string;
}

const ReporteSesiones: React.FC<ReporteSesionesProps> = ({ month, year }) => {
  const { data, loading, error } = useReports(month, year);

  if (loading) {
      return (
      <div className="text-center py-4">
        <p>Cargando datos de sesiones...</p>
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
            <CardTitle className="text-sm font-medium">Total de Sesiones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.sessions.total}</div>
            <p className="text-xs text-muted-foreground">
              Sesiones registradas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.sessions.averageDuration} min</div>
            <p className="text-xs text-muted-foreground">
              Por sesión
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Asistencia</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.sessions.attendanceRate * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Sesiones completadas
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
          <CardHeader>
            <CardTitle>Sesiones por Día</CardTitle>
          </CardHeader>
        <CardContent>
          <ChartContainer className="aspect-auto h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.sessions.byDay}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip
                  content={
                    <ChartTooltipContent className="bg-background" />
                  }
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="sesiones" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
    </div>
  );
};

export default ReporteSesiones;
