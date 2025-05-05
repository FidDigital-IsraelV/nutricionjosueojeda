
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Calendar, Clock, Edit, ExternalLink, User, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const NutritionSessionView = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { getNutritionSessionById, clients } = useData();
  const navigate = useNavigate();

  const session = getNutritionSessionById(id!);

  if (!session) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-800">Sesión no encontrada</h2>
        <p className="mt-2 text-gray-600">La sesión que busca no existe o ha sido eliminada.</p>
        <Button 
          className="mt-4" 
          onClick={() => navigate('/sesiones-nutricion')}
        >
          Volver a Sesiones
        </Button>
      </div>
    );
  }

  // Verificar si el cliente actual está asignado a esta sesión
  const isAssigned = currentUser.role === "client" 
    ? session.patients.includes(currentUser.id)
    : true;

  if (currentUser.role === "client" && !isAssigned) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-800">Acceso restringido</h2>
        <p className="mt-2 text-gray-600">No tienes acceso a esta sesión.</p>
        <Button 
          className="mt-4" 
          onClick={() => navigate('/sesiones-nutricion')}
        >
          Volver a Sesiones
        </Button>
      </div>
    );
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE d 'de' MMMM, yyyy", { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  // Formatear hora
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "HH:mm", { locale: es });
    } catch (e) {
      return "";
    }
  };

  // Obtener nombres de pacientes
  const getPatientNames = () => {
    return session.patients.map(id => {
      const client = clients.find(c => c.id === id);
      return client ? client : { id, name: "Paciente desconocido" };
    });
  };

  // Status badge
  const getStatusBadge = () => {
    switch (session.status) {
      case "programada":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Programada</Badge>;
      case "completada":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">Completada</Badge>;
      case "cancelada":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/sesiones-nutricion')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Detalle de la Sesión</h2>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{session.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge()}
                <span className="text-sm text-gray-500">
                  {session.patients.length} / {session.maxPatients} pacientes
                </span>
              </div>
            </div>
            
            {/* Botones de acción para nutricionistas */}
            {currentUser.role !== "client" && (
              <Button
                size="sm"
                onClick={() => navigate(`/sesiones-nutricion/editar/${session.id}`)}
              >
                <Edit className="mr-1 h-4 w-4" />
                Editar Sesión
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Descripción</h3>
            <p className="text-gray-700 whitespace-pre-line">{session.description}</p>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Fecha y Horario</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Fecha</div>
                    <div className="font-medium">{formatDate(session.startDateTime)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Horario</div>
                    <div className="font-medium">
                      {formatTime(session.startDateTime)} - {formatTime(session.endDateTime)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {session.zoomLink && (
              <div>
                <h3 className="text-lg font-medium mb-2">Enlace de la Sesión</h3>
                <Button 
                  className="flex items-center w-full justify-center"
                  onClick={() => window.open(session.zoomLink, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Unirse a la sesión de Zoom
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Abre Zoom para acceder a la sesión en línea
                </p>
              </div>
            )}
          </div>
          
          {/* Sección de pacientes (solo visible para nutricionistas) */}
          {currentUser.role !== "client" && (
            <>
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Pacientes</h3>
                
                {session.patients.length === 0 ? (
                  <p className="text-gray-500 italic">No hay pacientes asignados a esta sesión.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getPatientNames().map((client) => (
                      <div 
                        key={client.id} 
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <User className="h-5 w-5 text-gray-500 mr-2" />
                        <span>{client.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="bg-gray-50 p-6 flex justify-end">
          <Button onClick={() => navigate('/sesiones-nutricion')}>
            Volver a Sesiones
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NutritionSessionView;
