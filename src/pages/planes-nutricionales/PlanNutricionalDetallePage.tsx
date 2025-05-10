import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useMeals } from "@/hooks/useMeals";
import { useNutritionPlans } from "@/hooks/useNutritionPlans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { Check, ArrowLeft } from "lucide-react";

const traducirTipoComida = (tipo) => {
  switch (tipo) {
    case 'breakfast': return 'Desayuno';
    case 'lunch': return 'Almuerzo';
    case 'dinner': return 'Complementos';
    case 'snack': return 'Merienda';
    default: return tipo;
  }
};
const obtenerHoraPorDefecto = (tipo, hora) => {
  if (hora) return hora;
  switch (tipo) {
    case 'breakfast': return '8:00 am';
    case 'lunch': return '1:00 pm';
    case 'snack': return '7:00 pm';
    case 'dinner': return 'Sin hora especificada';
    default: return 'Sin hora especificada';
  }
};

const PlanNutricionalDetallePage = () => {
  const { id } = useParams();
  const { clients, supplements, foods, profiles } = useData();
  const { meals } = useMeals();
  const { getNutritionPlanById } = useNutritionPlans();
  const [plan, setPlan] = useState(null);
  const navigate = useNavigate();

  const getClientName = useCallback((clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      console.log('Cliente no encontrado:', clientId);
      return "Cliente desconocido";
    }
    
    const profile = profiles.find(p => p.id === client.profile_id);
    if (!profile) {
      console.log('Perfil no encontrado para el cliente:', client.profile_id);
      return client.personalInfo?.firstName || "Cliente desconocido";
    }
    
    return profile.name || client.personalInfo?.firstName || "Cliente desconocido";
  }, [clients, profiles]);

  useEffect(() => {
    async function fetchPlan() {
      const fetchedPlan = await getNutritionPlanById(id);
      setPlan(fetchedPlan);
    }
    fetchPlan();
  }, [id]);

  if (!plan) return <div>Cargando plan...</div>;
  const client = clients.find(c => c.id === plan.clientId);
  const getMealDetails = (mealId) => meals.find(meal => meal.id === mealId);

  // Helper para mostrar litros de agua
  const litrosAgua = plan.hydration?.waterLiters || plan.hydration?.daily_goal || null;
  const litrosAguaFormateado = litrosAgua ? (Number(litrosAgua) / (litrosAgua > 20 ? 1000 : 1)).toFixed(1) : null;

  return (
    <div className="max-w-4xl mx-auto py-8 print-area space-y-8">
      <Button onClick={() => navigate(-1)} className="mb-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium flex items-center">
        <ArrowLeft className="mr-2" />
        Volver
      </Button>
      <div className="print:hidden">
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-green-700">Plan Nutricional Personalizado</CardTitle>
              <img src="/path/to/logo.png" alt="Logo" className="w-32 h-32 object-contain" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Información del Cliente</h3>
                <h3 className="font-semibold text-gray-700">Nombre completo:</h3>
                <div className="font-normal">{getClientName(plan.clientId)}</div>
                <h3 className="font-semibold text-gray-700">Altura:</h3>
                <div className="font-normal">{client?.personalInfo?.height} cm</div>
                <h3 className="font-semibold text-gray-700">Peso:</h3>
                <div className="font-normal">{client?.weight} kg</div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Información del Plan</h3>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-700">Fecha de inicio:</h3>
                    <div className="font-normal">{format(new Date(plan.startDate), "dd/MM/yyyy")}</div>
                    {plan.endDate && (
                      <>
                        <h3 className="font-semibold text-gray-700">Fecha de fin:</h3>
                        <div className="font-normal">{format(new Date(plan.endDate), "dd/MM/yyyy")}</div>
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Estado:</h3>
                    <div className="font-normal">{plan.isActive ? "Activo" : "Inactivo"}</div>
                    <h3 className="font-semibold text-gray-700">Días de plan:</h3>
                    <div className="font-normal">{plan.dailyPlans.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="hidden print:block absolute inset-0 opacity-10 z-0 flex justify-center items-center">
        <img src="/path/to/logo.png" alt="Logo" className="w-64 h-64 object-contain" />
      </div>
      <Card className="mb-6 z-10">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">{plan.title}</CardTitle>
          <CardDescription className="text-lg font-semibold">
            {getClientName(plan.clientId)}
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">Objetivos y Restricciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm text-gray-500 mb-2">Objetivos</h4>
              <ul className="space-y-1">
                {plan.objectives.map((objective, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm text-gray-500 mb-2">Restricciones Alimentarias</h4>
              <ul className="space-y-1">
                {plan.restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="h-4 w-4 flex items-center justify-center text-white bg-red-500 rounded-full text-xs">!</span>
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
              <h4 className="text-sm text-gray-500 mt-4 mb-2">Alergias</h4>
              <ul className="space-y-1">
                {plan.allergies.map((allergy, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="h-4 w-4 flex items-center justify-center text-white bg-orange-500 rounded-full text-xs">!</span>
                    <span>{allergy}</span>
                  </li>
                ))}
              </ul>
              {plan.preferences && plan.preferences.length > 0 && (
                <>
                  <h4 className="text-sm text-gray-500 mt-4 mb-2">Preferencias Alimentarias</h4>
                  <ul className="space-y-1">
                    {plan.preferences.map((preference, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <span className="h-4 w-4 flex items-center justify-center text-white bg-yellow-500 rounded-full text-xs">!</span>
                        <span>{preference}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {plan.nutrientGoals && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Objetivos Nutricionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {plan.nutrientGoals.calories && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                  <div className="text-sm text-gray-500 mb-1">Calorías</div>
                  <div className="text-xl font-bold text-green-700">{plan.nutrientGoals.calories}</div>
                  <div className="text-xs text-gray-400">kcal</div>
                </div>
              )}
              {plan.nutrientGoals.protein && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                  <div className="text-sm text-gray-500 mb-1">Proteínas</div>
                  <div className="text-xl font-bold text-red-600">{plan.nutrientGoals.protein}</div>
                  <div className="text-xs text-gray-400">g</div>
                </div>
              )}
              {plan.nutrientGoals.carbs && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-center">
                  <div className="text-sm text-gray-500 mb-1">Carbohidratos</div>
                  <div className="text-xl font-bold text-amber-600">{plan.nutrientGoals.carbs}</div>
                  <div className="text-xs text-gray-400">g</div>
                </div>
              )}
              {plan.nutrientGoals.fat && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                  <div className="text-sm text-gray-500 mb-1">Grasas</div>
                  <div className="text-xl font-bold text-blue-600">{plan.nutrientGoals.fat}</div>
                  <div className="text-xs text-gray-400">g</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {plan.hydration && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Hidratación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center">
              <div className="h-8 w-8 flex items-center justify-center bg-blue-500 text-white rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v6m0 0 3 3m-3-3-3 3m3 9a6 6 0 0 0 6-6c0-4-3-6-6-9-3 3-6 5-6 9a6 6 0 0 0 6 6Z"/>
                </svg>
              </div>
              <span className="font-medium">Litros de agua recomendados:</span>
              <span className="text-lg font-semibold text-blue-700 ml-2">{litrosAguaFormateado} L/día</span>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="mb-6">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">Plan de Comidas Diarias</h2>
        {plan.dailyPlans.map((dayPlan, dayIndex) => (
          <Card key={dayIndex} className="mb-4">
            <CardHeader className="pb-3 bg-gray-50 border-b">
              <CardTitle className="text-md">Día {dayIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dayPlan.meals.map((meal, mealIndex) => {
                const mealDetails = getMealDetails(meal.meal_id || '');
                if (!mealDetails) return null;
                return (
                  <div key={mealIndex} className="p-5 border-b">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 flex items-center justify-center bg-amber-100 text-amber-700 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/>
                          <path d="M9 22V2"/>
                          <path d="M3 12h18"/>
                        </svg>
                      </div>
                      <h3 className="font-medium">{traducirTipoComida(mealDetails.type)}</h3>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      {mealDetails.foods?.map((food, index) => (
                        <li key={index} className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-lg font-bold">{food.food?.name}</p>
                          </div>
                          {food.food?.image_url && (
                            <img
                              src={food.food.image_url}
                              alt={food.food.name}
                              className="w-48 h-32 object-cover rounded-lg"
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                    {mealDetails.instructions && (
                      <div className="mt-2">
                        <p className="text-md font-bold text-gray-500">Instrucciones:</p>
                        <p className="text-lg text-gray-600 italic">{mealDetails.instructions}</p>
                      </div>
                    )}
                    {mealDetails.images && mealDetails.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mealDetails.images.map((image, imageIndex) => (
                          <img
                            key={imageIndex}
                            src={image}
                            alt={`Imagen de ${traducirTipoComida(mealDetails.type)}`}
                            className="rounded-lg object-cover w-full h-64"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
      {plan.supplements && Object.keys(plan.supplements).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold border-b pb-2 mb-3">Suplementos Recomendados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(plan.supplements).map(([supplementId, supplementData]) => {
              const supplement = supplements.find(s => s.id === supplementId);
              const dose = (supplementData as any).dose;
              const time = (supplementData as any).time;
              return (
                <Card key={supplementId} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {supplement?.image_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={supplement.image_url}
                            alt={supplement.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{supplement?.name || 'Suplemento no encontrado'}</h4>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Dosis:</span> {dose}
                          </p>
                          {time && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Horario:</span> {time}
                            </p>
                          )}
                          {supplement?.description && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Descripción:</span> {supplement.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {plan.additionalNotes && (
        <div className="mb-6">
          <h2 className="text-sm uppercase text-gray-500 font-medium mb-2">Notas Adicionales</h2>
          <p className="text-sm text-gray-700">{plan.additionalNotes}</p>
        </div>
      )}
      <div className="flex justify-center mt-8">
        <button 
          onClick={() => window.print()} 
          className="px-6 py-2.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium">
          Imprimir / Exportar PDF
        </button>
      </div>
    </div>
  );
};

export default PlanNutricionalDetallePage; 