
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ProgressRecord } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProgressChartProps {
  records: ProgressRecord[];
}

interface ChartDataPoint {
  date: string;
  weight?: number;
  waist?: number;
  hips?: number;
}

const ProgressChart = ({ records }: ProgressChartProps) => {
  const isMobile = useIsMobile();

  const formatData = (): ChartDataPoint[] => {
    return records
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((record) => ({
        date: new Date(record.date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        }),
        weight: record.weight,
        waist: record.measurements?.waist,
        hips: record.measurements?.hips,
      }));
  };

  const chartData = formatData();

  if (chartData.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Se necesitan al menos 2 registros para mostrar el gráfico de progreso.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="weight"
              name="Peso (kg)"
              stroke="#4CAF50"
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="waist"
              name="Cintura (cm)"
              stroke="#2196F3"
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="hips"
              name="Cadera (cm)"
              stroke="#FF9800"
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
