
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface WeightData {
  date: string;
  weight: number;
}

interface WeightProgressChartProps {
  data: WeightData[];
  targetWeight?: number;
}

const WeightProgressChart = ({ data, targetWeight }: WeightProgressChartProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Weight className="h-5 w-5" />
          Progreso de Peso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 'auto'] as any} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  name="Peso (kg)" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
                {targetWeight && (
                  <Line 
                    type="monotone" 
                    dataKey={() => targetWeight} 
                    name="Meta (kg)" 
                    stroke="#82ca9d" 
                    strokeDasharray="5 5" 
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground mb-4">No hay registros de peso todavía.</p>
              <Button asChild>
                <Link to="/progress">Registrar mi primer progreso</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightProgressChart;
