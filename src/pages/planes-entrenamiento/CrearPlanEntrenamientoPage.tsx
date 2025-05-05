
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { TrainingPlanForm } from "@/components/training/TrainingPlanForm";

const CrearPlanEntrenamientoPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const isEditing = !!id;

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
          <BreadcrumbPage>{isEditing ? "Editar Plan" : "Crear Plan"}</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <h1 className="text-3xl font-bold">
        {isEditing ? "Editar Plan de Entrenamiento" : "Crear Plan de Entrenamiento"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Plan" : "Nuevo Plan"}</CardTitle>
          <CardDescription>
            {isEditing 
              ? "Modifique los datos del plan de entrenamiento."
              : "Complete el formulario para crear un nuevo plan de entrenamiento."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrainingPlanForm 
            planId={id} 
            onClose={() => navigate("/planes-entrenamiento")} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CrearPlanEntrenamientoPage;
