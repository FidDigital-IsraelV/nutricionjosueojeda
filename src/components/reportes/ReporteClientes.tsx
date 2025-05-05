import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Users, Target, Calendar } from "lucide-react";
import { useReports } from "@/hooks/useReports";

interface ReporteClientesProps {
  month: string;
  year: string;
}

const ReporteClientes: React.FC<ReporteClientesProps> = ({ month, year }) => {
  const { data, loading, error } = useReports(month, year);

  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Cargando datos de clientes...</p>
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
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.clients.total}</div>
            <p className="text-xs text-muted-foreground">
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.clients.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Nuevos registros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Plan Activo</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.clients.withActivePlan}</div>
            <p className="text-xs text-muted-foreground">
              Clientes activos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución por Objetivo</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="aspect-auto h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.clients.byGoal}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.clients.byGoal.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(${index * 45}, 70%, 50%)`} 
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent className="bg-background" />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {data.clients.byGoal.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                  <div 
                    className="mr-2 h-3 w-3 rounded-sm" 
                    style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
                  />
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReporteClientes;
