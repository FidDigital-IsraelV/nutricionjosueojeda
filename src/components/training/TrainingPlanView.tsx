import React, { useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Edit, ArrowLeft, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { exportToPDF } from "@/utils/pdfExport";

import { useAuth } from "@/context/AuthContext";
import { useTrainingPlans } from "@/hooks/useTrainingPlans";

interface TrainingPlanViewProps {
  planId: string;
  onEdit?: () => void;
}

export function TrainingPlanView({ planId, onEdit }: TrainingPlanViewProps) {
  const { trainingPlans, clients, loading } = useTrainingPlans();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const pdfContentRef = useRef<HTMLDivElement>(null);

  console.log('ID buscado:', planId);
  console.log('Planes disponibles:', trainingPlans);
  console.log('Clientes disponibles:', clients);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p>Cargando plan de entrenamiento...</p>
        </CardContent>
      </Card>
    );
  }

  const plan = trainingPlans.find(p => p.id === planId);
  console.log('Plan encontrado:', plan);
  const client = plan ? clients.find(c => c.profile_id === plan.client_id) : undefined;
  console.log('Cliente encontrado:', client);

  if (!plan) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p>El plan de entrenamiento que estás buscando no existe o ha sido eliminado.</p>
          <p className="text-sm text-muted-foreground mt-2">ID buscado: {planId}</p>
          <p className="text-sm text-muted-foreground mt-2">Planes disponibles: {trainingPlans.map(p => p.id).join(', ')}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/planes-entrenamiento")}>
            Volver a planes de entrenamiento
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/planes-entrenamiento/editar/${planId}`);
    }
  };

  // Traducción de días de la semana
  const translateDay = (day: string) => {
    const days: Record<string, string> = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo",
    };
    return days[day] || day;
  };

  // Traducción de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Activo</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completado</Badge>;
      case "draft":
        return <Badge className="bg-gray-500">Borrador</Badge>;
      default:
        return null;
    }
  };

  const isEditable = currentUser?.role === "nutritionist" || currentUser?.role === "trainer";

  const handleExportPDF = async () => {
    if (pdfContentRef.current) {
      await exportToPDF(pdfContentRef.current, `plan_entrenamiento_${plan.title}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/planes-entrenamiento">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold">{plan.title}</h2>
          {getStatusBadge(plan.status)}
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportPDF} className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          {isEditable && (
            <Button onClick={handleEditClick} className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Content that will be exported to PDF */}
      <div ref={pdfContentRef} className="space-y-6 bg-white p-6 rounded-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">{plan.title}</h1>
          <p className="text-lg mt-2">Plan de Entrenamiento</p>
          <p className="text-gray-500">
            Para: {client?.profiles.name || "Cliente"} • Creado: {format(new Date(plan.start_date), "dd/MM/yyyy", { locale: es })}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del Plan</CardTitle>
            <CardDescription>Información general del plan de entrenamiento</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{client?.profiles.name || "Cliente desconocido"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <p className="font-medium capitalize">{
                plan.status === "active" ? "Activo" : 
                plan.status === "completed" ? "Completado" : 
                "Borrador"
              }</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
              <p className="font-medium">{format(new Date(plan.start_date), "dd/MM/yyyy", { locale: es })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Fin</p>
              <p className="font-medium">
                {plan.end_date 
                  ? format(new Date(plan.end_date), "dd/MM/yyyy", { locale: es })
                  : "No especificada"}
              </p>
            </div>
          </CardContent>

          {plan.description && (
            <CardContent>
              <p className="text-sm text-muted-foreground">Descripción</p>
              <p className="mt-1">{plan.description}</p>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rutinas de Entrenamiento</CardTitle>
            <CardDescription>Rutinas programadas para cada día de la semana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.routines.length > 0 ? (
              plan.routines.map((routine, index) => (
                <Card key={routine.id}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg font-semibold">
                      {translateDay(routine.day)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <pre className="whitespace-pre-wrap">{routine.exercises}</pre>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay rutinas definidas para este plan.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
