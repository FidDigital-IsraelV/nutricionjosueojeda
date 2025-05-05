
import React from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BodyMeasurementForm } from "@/components/measurements/BodyMeasurementForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

const CrearMedidaPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getClientById } = useData();
  
  // Verificar si el usuario tiene permisos para crear medidas
  const canCreateMeasurement = currentUser && (
    currentUser.role === "admin" ||
    currentUser.role === "nutritionist" || 
    currentUser.role === "trainer"
  );
  
  if (!canCreateMeasurement) {
    return <Navigate to="/medidas-corporales" replace />;
  }
  
  // Si hay un ID, verificar que el cliente exista
  const client = clientId ? getClientById(clientId) : null;
  
  const handleClose = () => {
    if (clientId) {
      navigate(`/medidas-corporales/${clientId}`);
    } else {
      navigate("/medidas-corporales");
    }
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
          <BreadcrumbLink href="/medidas-corporales">Medidas Corporales</BreadcrumbLink>
        </BreadcrumbItem>
        {client && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/medidas-corporales/${client.id}`}>{client.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Crear</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {client 
            ? `Crear Medida Corporal: ${client.name}` 
            : "Crear Medida Corporal"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Medida Corporal</CardTitle>
          <CardDescription>
            Complete el formulario para registrar una nueva medida corporal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BodyMeasurementForm
            onClose={handleClose}
            clientId={clientId}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CrearMedidaPage;
