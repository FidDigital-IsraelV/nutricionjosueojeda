import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Calendar, Activity, Award, Dumbbell, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import ClientList from "@/components/dashboard/ClientList";
import { Client, ProgressRecord, TrainingPlan } from "@/types";
import ClientWeightDistributionChart from "./charts/ClientWeightDistributionChart";
import ClientGoalDistributionChart from "./charts/ClientGoalDistributionChart";
import ClientsOverTimeChart from "./charts/ClientsOverTimeChart";
import { exportToPDF } from "@/utils/pdfExport";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TrainerDashboardProps {
  trainerId: string;
  clients: Client[];
  clientTrainingPlans: TrainingPlan[];
  clientAchievements: any[];
  getProgressRecordsByClient: (clientId: string) => ProgressRecord[];
  getClientById: (clientId: string) => Client | undefined;
}

const TrainerDashboard = ({
  trainerId,
  clients,
  clientTrainingPlans,
  clientAchievements,
  getProgressRecordsByClient,
  getClientById
}: TrainerDashboardProps) => {
  const tempPDFRef = useRef<HTMLDivElement>(null);
  const [exportingPlanId, setExportingPlanId] = useState<string | null>(null);

  const prepareClientWeightDistributionData = () => {
    if (!clients || clients.length === 0) return [];
    
    const weightRanges = [
      { name: 'Menos de 60kg', value: 0 },
      { name: '60-70kg', value: 0 },
      { name: '70-80kg', value: 0 },
      { name: '80-90kg', value: 0 },
      { name: '90-100kg', value: 0 },
      { name: 'Más de 100kg', value: 0 },
    ];
    
    clients.forEach(client => {
      const latestRecord = getProgressRecordsByClient(client.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      const weight = latestRecord?.weight || client.weight;
      
      if (weight < 60) weightRanges[0].value++;
      else if (weight < 70) weightRanges[1].value++;
      else if (weight < 80) weightRanges[2].value++;
      else if (weight < 90) weightRanges[3].value++;
      else if (weight < 100) weightRanges[4].value++;
      else weightRanges[5].value++;
    });
    
    return weightRanges;
  };
  
  const prepareClientGoalDistributionData = () => {
    if (!clients || clients.length === 0) return [];
    
    const goals = [
      { name: 'Perder peso', value: 0, color: '#FF6384' },
      { name: 'Mantener peso', value: 0, color: '#36A2EB' },
      { name: 'Aumentar peso', value: 0, color: '#FFCE56' }
    ];
    
    clients.forEach(client => {
      if (client.goals.weightGoal === 'lose') goals[0].value++;
      else if (client.goals.weightGoal === 'maintain') goals[1].value++;
      else goals[2].value++;
    });
    
    return goals.filter(goal => goal.value > 0);
  };
  
  const prepareClientAddedOverTimeData = () => {
    if (!clients || clients.length === 0) return [];
    
    const months = new Array(6).fill(0).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        clients: 0
      };
    });
    
    clients.forEach(client => {
      const creationDate = new Date(client.createdAt);
      
      // Convert months to numeric values for comparison
      const monthIndex = months.findIndex(m => {
        const monthDate = new Date();
        monthDate.setMonth(new Date().getMonth() - (5 - months.indexOf(m)));
        return monthDate.getMonth() === creationDate.getMonth() && 
               monthDate.getFullYear() === creationDate.getFullYear();
      });
      
      if (monthIndex >= 0) {
        for (let i = monthIndex; i < months.length; i++) {
          months[i].clients++;
        }
      }
    });
    
    return months;
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

  const handleExportPDF = async (plan: TrainingPlan) => {
    setExportingPlanId(plan.id);
    
    try {
      if (!tempPDFRef.current) return;
      
      // Clear the temp div
      tempPDFRef.current.innerHTML = '';
      
      // Create PDF content
      const client = getClientById(plan.clientId);
      const pdfContent = document.createElement('div');
      pdfContent.className = 'p-8 bg-white';
      
      // Header
      const header = document.createElement('div');
      header.className = 'text-center mb-8';
      header.innerHTML = `
        <h1 class="text-3xl font-bold">${plan.title}</h1>
        <p class="text-lg mt-2">Plan de Entrenamiento</p>
        <p class="text-gray-500">
          Para: ${client?.name || "Cliente"} • Creado: ${format(new Date(plan.startDate), "dd/MM/yyyy", { locale: es })}
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
            <p>${client?.name || "Cliente desconocido"}</p>
          </div>
          <div>
            <p class="font-semibold">Estado:</p>
            <p>${plan.status === "active" ? "Activo" : plan.status === "completed" ? "Completado" : "Borrador"}</p>
          </div>
          <div>
            <p class="font-semibold">Fecha de Inicio:</p>
            <p>${format(new Date(plan.startDate), "dd/MM/yyyy", { locale: es })}</p>
          </div>
          <div>
            <p class="font-semibold">Fecha de Fin:</p>
            <p>${plan.endDate ? format(new Date(plan.endDate), "dd/MM/yyyy", { locale: es }) : "No especificada"}</p>
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
  
  // Calculate statistics for training plan status
  const activePlans = clientTrainingPlans.filter(plan => plan.status === 'active').length;
  const completedPlans = clientTrainingPlans.filter(plan => plan.status === 'completed').length;
  const draftPlans = clientTrainingPlans.filter(plan => plan.status === 'draft').length;
  
  // Prepare data for charts
  const clientWeightDistributionData = prepareClientWeightDistributionData();
  const clientGoalDistributionData = prepareClientGoalDistributionData();
  const clientAddedOverTimeData = prepareClientAddedOverTimeData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Clientes"
          value={clients.length}
          description="Clientes activos"
          icon={Users}
        />
        <StatCard
          title="Planes Activos"
          value={activePlans}
          description="Planes de entrenamiento"
          icon={Dumbbell}
        />
        <StatCard
          title="Planes Completados"
          value={completedPlans}
          description="Entrenamientos finalizados"
          icon={Calendar}
        />
        <StatCard
          title="Logros Otorgados"
          value={clientAchievements.length}
          description="Insignias entregadas"
          icon={Award}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clientWeightDistributionData.length > 0 && (
          <ClientWeightDistributionChart data={clientWeightDistributionData} />
        )}
        
        {clientGoalDistributionData.length > 0 && (
          <ClientGoalDistributionChart data={clientGoalDistributionData} />
        )}
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Planes de Entrenamiento
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-4 h-80 overflow-auto">
              {clientTrainingPlans && clientTrainingPlans.length > 0 ? (
                <div className="space-y-2">
                  {clientTrainingPlans
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map(plan => (
                      <div 
                        key={plan.id}
                        className="block p-3 border rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <Link to={`/planes-entrenamiento/${plan.id}`} className="font-medium hover:underline">
                              {plan.title}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {new Date(plan.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="px-2" 
                              onClick={() => handleExportPDF(plan)}
                              disabled={!!exportingPlanId}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Exportar PDF</span>
                            </Button>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              plan.status === 'active' ? 'bg-green-100 text-green-800' : 
                              plan.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {plan.status === 'active' ? 'Activo' : 
                              plan.status === 'completed' ? 'Completado' : 'Borrador'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                  <div className="pt-4">
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/planes-entrenamiento">Ver todos los planes</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground mb-4">No hay planes de entrenamiento.</p>
                  <Button asChild>
                    <Link to="/planes-entrenamiento/new">Crear Plan</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes Recientes
            </h3>
          </div>
          <div className="card-content h-80 overflow-auto">
            {clients && clients.length > 0 ? (
              <div className="space-y-4">
                <ClientList 
                  clients={clients
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)} 
                />
                <div className="pt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/clientes">Ver todos los clientes</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground mb-4">No hay clientes registrados.</p>
                <Button asChild>
                  <Link to="/clients/new">Agregar Cliente</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div 
        ref={tempPDFRef} 
        className="hidden"
        style={{ position: 'absolute', left: '-9999px', width: '800px' }} 
      />
    </div>
  );
};

export default TrainerDashboard;
