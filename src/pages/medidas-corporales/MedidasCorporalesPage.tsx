
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Plus, ArrowLeft, ChevronRight } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

import { BodyMeasurementForm } from "@/components/measurements/BodyMeasurementForm";
import { BodyMeasurementList } from "@/components/measurements/BodyMeasurementList";
import { TooltipProvider } from "@/components/ui/tooltip";

interface MedidasCorporalesPageProps {
  mode?: "view" | "edit";
  clientId?: string;
}

const MedidasCorporalesPage = ({ mode = "view", clientId: propClientId }: MedidasCorporalesPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { clients, getClientById } = useData();
  
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false);
  
  const clientId = propClientId || id;
  const client = clientId ? getClientById(clientId) : undefined;
  
  // Si el usuario es cliente, solo mostrar sus propias medidas
  const filteredClients = clients.filter(c => {
    if (currentUser?.role === "client") {
      return c.userId === currentUser.id;
    }
    return true;
  });
  
  const canCreateMeasurement = currentUser?.role === "nutritionist" || currentUser?.role === "trainer";
  
  const handleAddMeasurement = () => {
    if (clientId) {
      navigate(`/medidas-corporales/new?clientId=${clientId}`);
    } else {
      navigate("/medidas-corporales/new");
    }
  };

  // Si el usuario es cliente, redirigir directamente a sus medidas
  React.useEffect(() => {
    if (currentUser?.role === "client" && !clientId && filteredClients.length === 1) {
      const userClient = filteredClients[0];
      navigate(`/medidas-corporales/${userClient.id}`);
    }
  }, [currentUser, clientId, filteredClients]);
  
  return (
    <TooltipProvider>
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
            <BreadcrumbLink href="/medidas-corporales">Medidas Corporales</BreadcrumbLink>
          </BreadcrumbItem>
          {client && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{client.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {client 
              ? `Medidas Corporales: ${client.name}`
              : "Medidas Corporales"}
          </h1>
          
          {canCreateMeasurement && (
            <Button onClick={handleAddMeasurement} className="flex items-center gap-2">
              <Plus size={16} /> Agregar Medida
            </Button>
          )}
        </div>

        {client ? (
          <BodyMeasurementList clientId={clientId} />
        ) : (
          <Tabs defaultValue={currentUser?.role === "client" && filteredClients.length === 1 ? filteredClients[0].id : "todos"} className="w-full">
            <TabsList className="mb-4">
              {currentUser?.role !== "client" && (
                <TabsTrigger value="todos">Todos los Pacientes</TabsTrigger>
              )}
              {filteredClients.map((client) => (
                <TabsTrigger key={client.id} value={client.id}>
                  {client.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {currentUser?.role !== "client" && (
              <TabsContent value="todos">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Medidas Corporales</CardTitle>
                    <CardDescription>
                      Listado de todas las medidas corporales registradas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BodyMeasurementList />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {filteredClients.map((client) => (
              <TabsContent key={client.id} value={client.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>Medidas Corporales: {client.name}</CardTitle>
                    <CardDescription>
                      Historial de medidas corporales para {client.name}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BodyMeasurementList clientId={client.id} />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Diálogo para añadir medida con ScrollArea */}
        <Dialog open={isAddMeasurementOpen} onOpenChange={setIsAddMeasurementOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Medida Corporal</DialogTitle>
              <DialogDescription>
                Complete los datos para registrar una nueva medida corporal.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[calc(90vh-180px)] pr-4">
              <BodyMeasurementForm 
                onClose={() => setIsAddMeasurementOpen(false)} 
                clientId={clientId}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default MedidasCorporalesPage;
