
import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

import { useData } from "@/context/DataContext";
import { NutritionFollowUp } from "@/types";

interface NutritionFollowUpListProps {
  clientId?: string;
  onCreateNew?: () => void;
}

const NutritionFollowUpList = ({ clientId, onCreateNew }: NutritionFollowUpListProps) => {
  const { nutritionFollowUps, nutritionPlans, clients, getNutritionFollowUpsByClient } = useData();
  const navigate = useNavigate();

  // Filter by client ID if provided
  const displayFollowUps = clientId
    ? getNutritionFollowUpsByClient(clientId)
    : nutritionFollowUps;

  // Sort by date, most recent first
  const sortedFollowUps = [...displayFollowUps].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getPlanTitle = (planId: string) => {
    const plan = nutritionPlans.find((p) => p.id === planId);
    return plan ? plan.title : "Plan desconocido";
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Cliente desconocido";
  };

  const getMoodLabel = (mood?: "good" | "normal" | "bad") => {
    switch (mood) {
      case "good":
        return <Badge className="bg-green-500">Bueno</Badge>;
      case "normal":
        return <Badge className="bg-blue-500">Normal</Badge>;
      case "bad":
        return <Badge className="bg-red-500">Malo</Badge>;
      default:
        return <Badge className="bg-gray-500">No especificado</Badge>;
    }
  };

  const handleViewDetails = (followUpId: string) => {
    navigate(`/seguimiento-nutricional/${followUpId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Seguimientos Nutricionales</h2>
        <Button onClick={onCreateNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Seguimiento
        </Button>
      </div>

      {sortedFollowUps.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                {!clientId && <TableHead>Cliente</TableHead>}
                <TableHead>Plan</TableHead>
                <TableHead>Estado de Ánimo</TableHead>
                <TableHead>Comidas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFollowUps.map((followUp) => (
                <TableRow key={followUp.id}>
                  <TableCell>
                    {format(new Date(followUp.date), "PPP", { locale: es })}
                  </TableCell>
                  {!clientId && (
                    <TableCell>{getClientName(followUp.clientId)}</TableCell>
                  )}
                  <TableCell>{getPlanTitle(followUp.planId)}</TableCell>
                  <TableCell>{getMoodLabel(followUp.mood)}</TableCell>
                  <TableCell>{followUp.completedMeals.length}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(followUp.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">
            No hay seguimientos nutricionales registrados.
          </p>
        </div>
      )}
    </div>
  );
};

export default NutritionFollowUpList;
