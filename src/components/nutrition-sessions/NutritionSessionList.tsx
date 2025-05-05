import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, Edit, Eye, Trash, User, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const NutritionSessionList = () => {
  const { currentUser } = useAuth();
  const { 
    nutritionSessions, 
    getNutritionSessionsByNutritionist,
    getNutritionSessionsByPatient,
    deleteNutritionSession,
    clients,
    nutritionists
  } = useData();
  const navigate = useNavigate();

  // Obtener sesiones según el rol del usuario
  const sessions = React.useMemo(() => {
    console.log('Usuario actual:', currentUser);
    console.log('Todas las sesiones:', nutritionSessions);
    
    let filteredSessions;
    if (currentUser.role === "client") {
      filteredSessions = getNutritionSessionsByPatient(currentUser.id);
      console.log('Sesiones filtradas para cliente:', filteredSessions);
    } else if (currentUser.role === "nutritionist") {
      // Obtener el ID del nutricionista desde la tabla de nutricionistas
      const nutritionist = nutritionists.find(n => n.userId === currentUser.id);
      if (nutritionist) {
        filteredSessions = getNutritionSessionsByNutritionist(nutritionist.id);
        console.log('Sesiones filtradas para nutricionista:', filteredSessions);
      } else {
        console.log('No se encontró el nutricionista para el usuario:', currentUser.id);
        filteredSessions = [];
      }
    } else {
      filteredSessions = nutritionSessions;
      console.log('Todas las sesiones (admin):', filteredSessions);
    }
    
    return filteredSessions;
  }, [currentUser, nutritionSessions, getNutritionSessionsByNutritionist, getNutritionSessionsByPatient, nutritionists]);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy - HH:mm", { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  // Obtener nombres de pacientes
  const getPatientNames = (patientIds: string[]) => {
    return patientIds.map(id => {
      const client = clients.find(c => c.id === id);
      return client ? client.name : "Desconocido";
    });
  };

  // Status styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "programada":
        return "bg-blue-100 text-blue-800";
      case "completada":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {currentUser.role === "client" ? "Mis Sesiones" : "Sesiones de Nutrición"}
        </h2>
        {currentUser.role !== "client" && (
          <Button onClick={() => navigate("/sesiones-nutricion/crear")}>
            Crear Sesión
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border">
          <h3 className="text-lg font-medium text-gray-600 mb-2">No hay sesiones disponibles</h3>
          <p className="text-gray-500">
            {currentUser.role === "client"
              ? "No hay sesiones asignadas a tu perfil en este momento."
              : "No se han creado sesiones de nutrición."}
          </p>
          {currentUser.role !== "client" && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/sesiones-nutricion/crear")}
            >
              Crear Primera Sesión
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <div className={`px-4 py-2 ${getStatusStyle(session.status)} flex justify-between items-center`}>
                <span className="font-medium capitalize">{session.status}</span>
                <span className="text-sm">
                  {session.patients.length} / {session.maxPatients} pacientes
                </span>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 line-clamp-1">{session.title}</h3>
                <p className="text-gray-600 line-clamp-2 mb-4">{session.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Inicio:</div>
                      <div className="text-sm text-gray-600">{formatDate(session.startDateTime)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Finalización:</div>
                      <div className="text-sm text-gray-600">{formatDate(session.endDateTime)}</div>
                    </div>
                  </div>

                  {currentUser.role !== "client" && (
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Pacientes:</div>
                        <div className="text-sm text-gray-600">
                          {session.patients.length === 0 ? (
                            <span className="italic">Sin pacientes asignados</span>
                          ) : (
                            getPatientNames(session.patients).map((name, index) => (
                              <div key={index} className="line-clamp-1">{name}</div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{session.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Descripción</h4>
                        <p className="text-gray-600">{session.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Fecha y Hora</h4>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>Inicio: {formatDate(session.startDateTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>Finalización: {formatDate(session.endDateTime)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Detalles</h4>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Estado:</span>
                              <span className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(session.status)}`}>
                                {session.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Capacidad:</span>
                              <span>{session.patients.length} / {session.maxPatients} pacientes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {session.patients.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Pacientes Asignados</h4>
                          <div className="space-y-2">
                            {getPatientNames(session.patients).map((name, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span>{name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {session.zoomLink && (
                        <div>
                          <h4 className="font-medium mb-2">Enlace de Zoom</h4>
                          <a 
                            href={session.zoomLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {session.zoomLink}
                          </a>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                {currentUser.role !== "client" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Está seguro de eliminar esta sesión?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. La sesión se eliminará permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteNutritionSession(session.id)}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NutritionSessionList;
