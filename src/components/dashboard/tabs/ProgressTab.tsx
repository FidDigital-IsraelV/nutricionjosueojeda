
import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRecord } from "@/types";

interface ProgressTabProps {
  clientProgressRecords: ProgressRecord[];
}

const ProgressTab = ({ clientProgressRecords }: ProgressTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Progreso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {clientProgressRecords.length > 0 ? (
          <div className="space-y-6">
            <h3 className="font-medium mb-4">Historial de Medidas</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Peso (kg)</th>
                    <th className="text-left p-2">% Grasa</th>
                    <th className="text-left p-2">Masa Muscular</th>
                  </tr>
                </thead>
                <tbody>
                  {clientProgressRecords
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((record, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{new Date(record.date).toLocaleDateString('es-ES')}</td>
                      <td className="p-2">{record.weight || "N/A"}</td>
                      <td className="p-2">N/A</td>
                      <td className="p-2">N/A</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" asChild>
                <Link to="/progress">
                  Ver Historial Completo
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No hay datos de progreso disponibles</h3>
            <p className="text-muted-foreground mb-4">
              Tu nutricionista o entrenador aún no ha registrado tus medidas corporales.
            </p>
            <Button asChild>
              <Link to="/sesiones-nutricion/crear">
                Solicitar Medición
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressTab;
