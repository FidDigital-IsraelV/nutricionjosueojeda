import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useMeals } from "@/hooks/useMeals";
import { useNutritionPlans } from "@/hooks/useNutritionPlans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";

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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">{plan.title}</CardTitle>
          <CardDescription className="text-lg font-semibold">
            {getClientName(plan.clientId)}
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Nombre:</span> {getClientName(plan.clientId)}</p>
              {client?.personalInfo?.birthDate && (
                <p><span className="font-medium">Fecha de nacimiento:</span> {format(new Date(client.personalInfo.birthDate), "dd/MM/yyyy")}</p>
              )}
            </div>
            <div>
              <p><span className="font-medium">Altura:</span> {client?.personalInfo?.height} cm</p>
              <p><span className="font-medium">Peso:</span> {client?.weight} kg</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Información del Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Fecha de inicio:</span> {format(new Date(plan.startDate), "dd/MM/yyyy")}</p>
              {plan.endDate && (
                <p><span className="font-medium">Fecha de fin:</span> {format(new Date(plan.endDate), "dd/MM/yyyy")}</p>
              )}
            </div>
            <div>
              <p><span className="font-medium">Estado:</span> {plan.isActive ? "Activo" : "Inactivo"}</p>
              <p><span className="font-medium">Días de plan:</span> {plan.dailyPlans.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Objetivos y Restricciones</CardTitle>
        </CardHeader>
        <CardContent>
          {plan.objectives && plan.objectives.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold mb-1">Objetivos:</h3>
              <ul className="list-disc pl-5">
                {plan.objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          )}
          {plan.restrictions && plan.restrictions.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold mb-1">Restricciones Alimentarias:</h3>
              <ul className="list-disc pl-5">
                {plan.restrictions.map((restriction, idx) => (
                  <li key={idx}>{restriction}</li>
                ))}
              </ul>
            </div>
          )}
          {plan.allergies && plan.allergies.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold mb-1">Alergias:</h3>
              <ul className="list-disc pl-5">
                {plan.allergies.map((allergy, idx) => (
                  <li key={idx}>{allergy}</li>
                ))}
              </ul>
            </div>
          )}
          {plan.preferences && plan.preferences.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1">Preferencias Alimentarias:</h3>
              <ul className="list-disc pl-5">
                {plan.preferences.map((preference, idx) => (
                  <li key={idx}>{preference}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      {plan.nutrientGoals && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Objetivos Nutricionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {plan.nutrientGoals.calories && (
                <div>
                  <p className="font-semibold">Calorías</p>
                  <p>{plan.nutrientGoals.calories} kcal</p>
                </div>
              )}
              {plan.nutrientGoals.protein && (
                <div>
                  <p className="font-semibold">Proteínas</p>
                  <p>{plan.nutrientGoals.protein} g</p>
                </div>
              )}
              {plan.nutrientGoals.carbs && (
                <div>
                  <p className="font-semibold">Carbohidratos</p>
                  <p>{plan.nutrientGoals.carbs} g</p>
                </div>
              )}
              {plan.nutrientGoals.fat && (
                <div>
                  <p className="font-semibold">Grasas</p>
                  <p>{plan.nutrientGoals.fat} g</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {plan.hydration && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Hidratación</CardTitle>
          </CardHeader>
          <CardContent>
            <p><span className="font-medium">Litros de agua recomendados:</span> {litrosAguaFormateado ? `${litrosAguaFormateado} L` : 'No especificado'}</p>
            {plan.hydration.notes && (
              <p><span className="font-medium">Notas:</span> {plan.hydration.notes}</p>
            )}
          </CardContent>
        </Card>
      )}
      <div className="mb-6">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">Plan de Comidas Diarias</h2>
        {plan.dailyPlans.map((dayPlan, dayIndex) => (
          <div key={dayIndex} className="mb-6 pb-4 border-b last:border-b-0">
            <h3 className="font-bold text-lg mb-3">Día {dayIndex + 1}</h3>
            <div className="space-y-4">
              {dayPlan.meals?.map((meal, mealIndex) => {
                const mealDetails = getMealDetails(meal.meal_id || '');
                if (!mealDetails) return null;
                return (
                  <Card key={mealIndex} className="mb-4">
                    <CardHeader>
                      <CardTitle>{traducirTipoComida(mealDetails.type) || `Comida ${mealIndex + 1}`}</CardTitle>
                      <CardDescription>{obtenerHoraPorDefecto(mealDetails.type, mealDetails.time)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {mealDetails.foods?.filter(food => {
                          const foodData = foods.find(f => f.id === food.food_id);
                          return !!foodData;
                        }).map((food, foodIndex) => {
                          const foodData = foods.find(f => f.id === food.food_id);
                          return (
                            <div key={foodIndex} className="flex justify-between items-center gap-4 mb-4">
                              <div>
                                <p className="text-lg font-semibold">{foodData?.name || 'Alimento'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {food.quantity ? `${food.quantity} ${food.unit}` : foodData?.servingUnit}
                                </p>
                              </div>
                              {foodData?.image_url && (
                                <img
                                  src={foodData.image_url}
                                  alt={foodData.name || 'Alimento'}
                                  className="w-64 h-40 object-cover rounded-lg flex-shrink-0"
                                />
                              )}
                            </div>
                          );
                        })}
                        {mealDetails.instructions && (
                          <div>
                            <h4 className="font-medium mb-2">Instrucciones de preparación</h4>
                            <p className="text-lg text-muted-foreground">{mealDetails.instructions}</p>
                          </div>
                        )}
                        {mealDetails.notes && (
                          <div>
                            <h4 className="font-medium mb-2">Notas</h4>
                            <p className="text-base text-muted-foreground">{mealDetails.notes}</p>
                          </div>
                        )}
                        {mealDetails.images && mealDetails.images.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Fotos</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {mealDetails.images.map((image, imageIndex) => (
                                <img
                                  key={imageIndex}
                                  src={image}
                                  alt={`Foto ${imageIndex + 1} de ${mealDetails.type || 'comida'}`}
                                  className="rounded-lg object-cover aspect-square w-full h-64"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
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
          <h2 className="text-xl font-bold border-b pb-2 mb-3">Notas Adicionales</h2>
          <p>{plan.additionalNotes}</p>
        </div>
      )}
      <div className="flex justify-center mt-8">
        <Button 
          className="no-print"
          onClick={() => window.print()}
          size="lg"
        >
          Imprimir / Exportar PDF
        </Button>
      </div>
    </div>
  );
};

export default PlanNutricionalDetallePage; 