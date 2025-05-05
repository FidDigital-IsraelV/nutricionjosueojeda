import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BodyMeasurement, Client, Profile } from "@/types";
import { useData } from "@/context/DataContext";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface BodyMeasurementViewProps {
  measurement: BodyMeasurement;
  onClose: () => void;
}

export const BodyMeasurementView = ({ measurement, onClose }: BodyMeasurementViewProps) => {
  const { clients, profiles, users } = useData();
  
  const client = clients.find(c => c.id === measurement.client_id);
  const clientProfile = client ? profiles.find(p => p.id === client.profile_id) : null;
  const creator = users.find(u => u.id === measurement.created_by);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Fecha no válida";
      }
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return "Fecha no válida";
    }
  };
  
  const getBmiLabel = (bmi: number) => {
    if (bmi < 18.5) return "Bajo peso";
    if (bmi < 25) return "Peso normal";
    if (bmi < 30) return "Sobrepeso";
    if (bmi < 35) return "Obesidad I";
    if (bmi < 40) return "Obesidad II";
    return "Obesidad III";
  };
  
  const getBmiBadgeVariant = (bmi: number) => {
    if (bmi < 18.5) return "outline";
    if (bmi < 25) return "default";
    if (bmi < 30) return "secondary";
    return "destructive";
  };
  
  return (
    <div className="space-y-4">
      {/* Información general */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Paciente</h3>
          <p className="text-lg font-medium">{clientProfile?.name || client?.name || "Cliente desconocido"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Fecha de medición</h3>
          <p className="text-lg font-medium">
            {formatDate(measurement.date)}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Registrado por</h3>
          <p className="text-lg font-medium">{creator?.name || "Usuario desconocido"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Fecha de registro</h3>
          <p className="text-lg font-medium">
            {formatDate(measurement.created_at)}
          </p>
        </div>
      </div>
      
      <Separator />
      
      {/* Medidas básicas */}
      <div>
        <h3 className="text-lg font-medium mb-2">Medidas Básicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <span className="text-sm text-gray-500">Peso</span>
              <span className="text-2xl font-bold">{measurement.measurements.weight} kg</span>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <span className="text-sm text-gray-500">Altura</span>
              <span className="text-2xl font-bold">{measurement.measurements.height} cm</span>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <span className="text-sm text-gray-500">IMC</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{measurement.measurements.bmi?.toFixed(1) || "N/A"}</span>
                {measurement.measurements.bmi && (
                  <Badge variant={getBmiBadgeVariant(measurement.measurements.bmi)}>
                    {getBmiLabel(measurement.measurements.bmi)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Separator />
      
      {/* Medidas corporales */}
      <div>
        <h3 className="text-lg font-medium mb-2">Medidas Corporales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Pecho</h4>
            <p className="text-lg">{measurement.measurements.chest ? `${measurement.measurements.chest} cm` : "No registrado"}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Cintura</h4>
            <p className="text-lg">{measurement.measurements.waist ? `${measurement.measurements.waist} cm` : "No registrado"}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Cadera</h4>
            <p className="text-lg">{measurement.measurements.hips ? `${measurement.measurements.hips} cm` : "No registrado"}</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-base font-medium mb-2">Brazos</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medida</TableHead>
                  <TableHead>Izquierdo (cm)</TableHead>
                  <TableHead>Derecho (cm)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Bíceps</TableCell>
                  <TableCell>{measurement.measurements.arms || "-"}</TableCell>
                  <TableCell>{measurement.measurements.arms || "-"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-2">Piernas</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medida</TableHead>
                  <TableHead>Izquierdo (cm)</TableHead>
                  <TableHead>Derecho (cm)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Muslo</TableCell>
                  <TableCell>{measurement.measurements.thighs || "-"}</TableCell>
                  <TableCell>{measurement.measurements.thighs || "-"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Composición corporal */}
      <div>
        <h3 className="text-lg font-medium mb-2">Composición Corporal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">% Grasa corporal</h4>
            <p className="text-lg">
              {measurement.measurements.body_fat ? `${measurement.measurements.body_fat}%` : "No registrado"}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">% Masa muscular</h4>
            <p className="text-lg">
              {measurement.measurements.muscle_mass ? `${measurement.measurements.muscle_mass}%` : "No registrado"}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Grasa visceral</h4>
            <p className="text-lg">
              {measurement.measurements.visceral_fat ? `${measurement.measurements.visceral_fat}` : "No registrado"}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">TMB</h4>
            <p className="text-lg">
              {measurement.measurements.basal_metabolic_rate ? `${measurement.measurements.basal_metabolic_rate} kcal` : "No registrado"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Notas */}
      {measurement.notes && (
        <>
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Notas</h3>
            <Card>
              <CardContent className="p-4">
                <p className="whitespace-pre-wrap">{measurement.notes}</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* Botones de acción */}
      <div className="flex justify-end pt-4">
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};

export default BodyMeasurementView;
