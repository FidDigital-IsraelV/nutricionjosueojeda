import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CalendarCheck,
  ChevronRight,
  Edit,
  Trash,
  PlayCircle,
  PauseCircle,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { useTrainingPlans } from '@/hooks/useTrainingPlans';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { exportToPDF } from "@/utils/pdfExport";

interface TrainingPlanListProps {
  clientId?: string;
  onEdit?: (planId: string) => void;
  onDelete?: (planId: string) => void;
}

export function TrainingPlanList({ clientId, onEdit, onDelete }: TrainingPlanListProps) {
  const { 
    trainingPlans, 
    clients, 
    loading, 
    error,
    deleteTrainingPlan, 
    updateTrainingPlan 
  } = useTrainingPlans();
  
  const navigate = useNavigate();
  const [exportingPlanId, setExportingPlanId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Temporary div for PDF export
  const tempPDFRef = useRef<HTMLDivElement>(null);

  // Filtrar planes según el usuario actual y clientId si se proporciona
  const filteredPlans = trainingPlans.filter((plan) => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (clientId) return plan.client_id === clientId;
    
    return true; // Nutricionistas ven todos los planes
  });

  const handlePlanStatusChange = async (plan: any, newStatus: "active" | "completed" | "draft") => {
    const success = await updateTrainingPlan({
      ...plan,
      status: newStatus,
    });
    
    if (!success) {
      alert('Error al actualizar el estado del plan');
    }
  };

  const handleView = (planId: string) => {
    console.log('Navegando a detalles del plan:', planId);
    console.log('Plan actual:', trainingPlans.find(p => p.id === planId));
    navigate(`/planes-entrenamiento/${planId}`);
  };

  const handleEdit = (planId: string) => {
    if (onEdit) {
      onEdit(planId);
    } else {
      navigate(`/planes-entrenamiento/editar/${planId}`);
    }
  };

  const handleDelete = async (planId: string) => {
    if (onDelete) {
      onDelete(planId);
    } else {
      if (window.confirm("¿Está seguro de que desea eliminar este plan de entrenamiento?")) {
        const success = await deleteTrainingPlan(planId);
        if (!success) {
          alert('Error al eliminar el plan');
        }
      }
    }
  };

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

  const handleExportPDF = async (plan: any) => {
    setExportingPlanId(plan.id);
    
    try {
      if (!tempPDFRef.current) return;
      
      // Clear the temp div
      tempPDFRef.current.innerHTML = '';
      
      // Create PDF content
      const client = clients.find(c => c.profile_id === plan.client_id);
      const pdfContent = document.createElement('div');
      pdfContent.className = 'p-8 bg-white';
      
      // Header
      const header = document.createElement('div');
      header.className = 'text-center mb-8';
      header.innerHTML = `
        <h1 class="text-3xl font-bold">${plan.title}</h1>
        <p class="text-lg mt-2">Plan de Entrenamiento</p>
        <p class="text-gray-500">
          Para: ${client?.profiles.name || "Cliente"} • Creado: ${format(new Date(plan.start_date), "dd/MM/yyyy", { locale: es })}
        </p>
      `;
      pdfContent.appendChild(header);
      
      // Plan details
      const details = document.createElement('div');
      details.className = 'mb-8 p-4 border rounded-lg';
      details.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Detalles del Plan</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="font-semibold">Cliente:</p>
            <p>${client?.profiles?.name || "Cliente desconocido"}</p>
          </div>
          <div>
            <p class="font-semibold">Estado:</p>
            <p>${plan.status === "active" ? "Activo" : plan.status === "completed" ? "Completado" : "Borrador"}</p>
          </div>
          <div>
            <p class="font-semibold">Fecha de Inicio:</p>
            <p>${format(new Date(plan.start_date), "dd/MM/yyyy", { locale: es })}</p>
          </div>
          <div>
            <p class="font-semibold">Fecha de Fin:</p>
            <p>${plan.end_date ? format(new Date(plan.end_date), "dd/MM/yyyy", { locale: es }) : "No especificada"}</p>
          </div>
        </div>
        ${plan.description ? `
        <div class="mt-4">
          <p class="font-semibold">Descripción:</p>
          <p>${plan.description}</p>
        </div>
        ` : ''}
      `;
      pdfContent.appendChild(details);
      
      // Routines
      const routines = document.createElement('div');
      routines.className = 'p-4 border rounded-lg';
      routines.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Rutinas de Entrenamiento</h2>
      `;
      
      if (plan.routines.length > 0) {
        const routineList = document.createElement('div');
        routineList.className = 'space-y-4';
        
        plan.routines.forEach(routine => {
          const routineCard = document.createElement('div');
          routineCard.className = 'p-4 border rounded-lg';
          routineCard.innerHTML = `
            <h3 class="font-bold">${translateDay(routine.day)}</h3>
            <pre class="whitespace-pre-wrap mt-2">${routine.exercises}</pre>
          `;
          routineList.appendChild(routineCard);
        });
        
        routines.appendChild(routineList);
      } else {
        routines.innerHTML += `<p class="text-center py-4">No hay rutinas definidas para este plan.</p>`;
      }
      
      pdfContent.appendChild(routines);
      
      // Add content to temporary div
      tempPDFRef.current.appendChild(pdfContent);
      
      // Export the content
      await exportToPDF(tempPDFRef.current, `plan_entrenamiento_${plan.title}`);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    } finally {
      setExportingPlanId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Activo", color: "bg-green-500" },
      completed: { label: "Completado", color: "bg-blue-500" },
      draft: { label: "Borrador", color: "bg-gray-500" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Cargando planes de entrenamiento...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 text-center">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (filteredPlans.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No hay planes de entrenamiento disponibles.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Buscar planes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Rutinas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.title}</TableCell>
                  <TableCell>
                    {(() => {
                      const client = clients.find(c => c.profile_id === plan.client_id);
                      console.log('Plan:', plan);
                      console.log('Client ID buscado:', plan.client_id);
                      console.log('Cliente encontrado:', client);
                      console.log('Estructura de profiles:', client?.profiles);
                      return client?.profiles.name || "Cliente desconocido";
                    })()}
                  </TableCell>
                  <TableCell>
                    {format(new Date(plan.start_date), "dd/MM/yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {plan.end_date ? format(new Date(plan.end_date), "dd/MM/yyyy", { locale: es }) : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(plan.status)}</TableCell>
                  <TableCell>
                    {plan.routines?.length || 0} rutinas
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(plan.id)}>
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(plan.id)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePlanStatusChange(plan, plan.status === "active" ? "completed" : "active")}
                        >
                          {plan.status === "active" ? (
                            <>
                              <PauseCircle className="mr-2 h-4 w-4" />
                              Marcar como completado
                            </>
                          ) : (
                            <>
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Marcar como activo
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hidden div for PDF generation */}
      <div 
        ref={tempPDFRef} 
        className="hidden"
        style={{ position: 'absolute', left: '-9999px', width: '800px' }} 
      />
    </div>
  );
}
