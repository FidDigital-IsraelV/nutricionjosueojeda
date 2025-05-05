import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { TrainingPlanView } from "@/components/training/TrainingPlanView";
import { TrainingPlanForm } from "@/components/training/TrainingPlanForm";
import { useTrainingPlans } from "@/hooks/useTrainingPlans";

const PlanEntrenamientoDetailPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { trainingPlans, loading } = useTrainingPlans();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  console.log('PlanEntrenamientoDetailPage - ID:', planId);
  console.log('PlanEntrenamientoDetailPage - Planes:', trainingPlans);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Cargando...</h1>
        <p>Por favor espere mientras se cargan los datos del plan.</p>
      </div>
    );
  }

  const plan = planId ? trainingPlans.find(p => p.id === planId) : undefined;
  console.log('PlanEntrenamientoDetailPage - Plan encontrado:', plan);

  if (!plan) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Plan no encontrado</h1>
        <p>El plan de entrenamiento que estás buscando no existe o ha sido eliminado.</p>
        <p className="text-sm text-gray-500 mt-2">ID buscado: {planId}</p>
        <p className="text-sm text-gray-500 mt-2">Planes disponibles: {trainingPlans.map(p => p.id).join(', ')}</p>
        <button 
          onClick={() => navigate("/planes-entrenamiento")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver a planes de entrenamiento
        </button>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/planes-entrenamiento">Planes de Entrenamiento</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>{plan.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>

      <TrainingPlanView planId={planId} onEdit={handleEdit} />

      {/* Diálogo para editar plan */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Editar Plan de Entrenamiento</DialogTitle>
            <DialogDescription>
              Modifique los datos del plan de entrenamiento.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(90vh-180px)] pr-4">
            <TrainingPlanForm 
              planId={planId} 
              onClose={() => setIsEditDialogOpen(false)} 
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanEntrenamientoDetailPage;
