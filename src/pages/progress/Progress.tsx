
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import ProgressForm from "@/components/progress/ProgressForm";
import ProgressChart from "@/components/progress/ProgressChart";
import ProgressTable from "@/components/progress/ProgressTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Navigate } from "react-router-dom";

const Progress = () => {
  const { currentUser } = useAuth();
  const { clients, progressRecords, getProgressRecordsByClient } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get client ID from the current user
  const client = clients.find(c => c.userId === currentUser?.id);
  const clientId = client?.id;

  // Get progress records for the client
  const clientProgressRecords = clientId ? getProgressRecordsByClient(clientId) : [];

  // Si el usuario no es un cliente, redirigir a la página principal
  if (currentUser?.role !== "client") {
    return <Navigate to="/dashboard" replace />;
  }

  // If no client found, show an error
  if (!clientId) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mi Progreso</h1>
        <div className="text-center py-12">
          <p className="text-red-500">No se encontró información del cliente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mi Progreso</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Registro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Progreso</DialogTitle>
            </DialogHeader>
            <ProgressForm 
              clientId={clientId} 
              onSuccess={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <ProgressChart records={clientProgressRecords} />
        </TabsContent>

        <TabsContent value="history">
          <ProgressTable records={clientProgressRecords} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Progress;
