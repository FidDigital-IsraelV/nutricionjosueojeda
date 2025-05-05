import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Plus, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

import { TrainingPlanList } from "@/components/training/TrainingPlanList";
import { TrainingPlanForm } from "@/components/training/TrainingPlanForm";
import { useAuth } from "@/context/AuthContext";
import { useTrainingPlans } from "@/hooks/useTrainingPlans";

interface PlanesEntrenamientoPageProps {
  mode?: "create" | "view" | "edit";
  clientId?: string;
}

const PlanesEntrenamientoPage = ({ mode = "view", clientId: propClientId }: PlanesEntrenamientoPageProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(mode === "create");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { trainingPlans, fetchTrainingPlans } = useTrainingPlans();
  const navigate = useNavigate();
  const location = useLocation();

  const canCreatePlan = currentUser?.role === "nutritionist" || currentUser?.role === "trainer";

  // Recargar planes cuando la ubicación cambie
  useEffect(() => {
    fetchTrainingPlans();
  }, [location.pathname]);

  const handleCreatePlan = () => {
    if (mode === "create") {
      navigate("/planes-entrenamiento");
    } else {
      setIsCreateDialogOpen(true);
    }
  };

  const handleEditPlan = (planId: string) => {
    setEditingPlanId(planId);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    fetchTrainingPlans(); // Recargar planes después de crear uno nuevo
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
        {mode === "create" && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Crear</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {mode === "create" 
            ? "Crear Plan de Entrenamiento" 
            : "Planes de Entrenamiento"}
        </h1>
        
        {canCreatePlan && mode !== "create" && (
          <Button onClick={handleCreatePlan} className="flex items-center gap-2">
            <Plus size={16} /> Crear Plan
          </Button>
        )}
      </div>

      {mode === "create" ? (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Plan de Entrenamiento</CardTitle>
            <CardDescription>
              Complete el formulario para crear un nuevo plan de entrenamiento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrainingPlanForm
              onClose={() => navigate("/planes-entrenamiento")}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {currentUser?.role === "client" ? (
            <Card>
              <CardHeader>
                <CardTitle>Mis Planes de Entrenamiento</CardTitle>
                <CardDescription>
                  Planes de entrenamiento asignados a ti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TrainingPlanList clientId={currentUser.id} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Todos los Planes de Entrenamiento</CardTitle>
                <CardDescription>
                  Gestione los planes de entrenamiento de sus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TrainingPlanList />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Diálogo para crear plan */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Crear Plan de Entrenamiento</DialogTitle>
            <DialogDescription>
              Complete el formulario para crear un nuevo plan de entrenamiento.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(90vh-180px)] pr-4">
            <TrainingPlanForm onClose={handleCloseCreateDialog} />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar plan */}
      <Dialog open={!!editingPlanId} onOpenChange={(open) => !open && setEditingPlanId(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Editar Plan de Entrenamiento</DialogTitle>
            <DialogDescription>
              Modifique los datos del plan de entrenamiento.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(90vh-180px)] pr-4">
            {editingPlanId && (
              <TrainingPlanForm 
                planId={editingPlanId} 
                onClose={() => setEditingPlanId(null)} 
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanesEntrenamientoPage;
