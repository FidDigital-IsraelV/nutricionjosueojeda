import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NutritionPlan, DailyPlan, FoodItem } from "@/types";
import { useData } from "@/context/DataContext";
import { useMeals } from "@/hooks/useMeals";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar, Edit, Trash, FileDown, Eye } from "lucide-react";
import { exportToPDF } from "@/utils/pdfExport";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface NutritionPlanListProps {
  plans: NutritionPlan[];
  onDelete: (id: string) => void;
}

interface Meal {
  id: string;
  meal_id?: string;
  type: string;
  time?: string;
  foods?: FoodItem[];
  instructions?: string;
  notes?: string;
  image_url?: string;
}

const NutritionPlanList = ({ plans, onDelete }: NutritionPlanListProps) => {
  const navigate = useNavigate();
  const { clients, foods, supplements, profiles } = useData();
  const { meals, loading: mealsLoading } = useMeals();
  const planRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const detailedPlanRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [viewingPlan, setViewingPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateDayTotal = (dayPlan: DailyPlan, nutrient: 'calories' | 'protein' | 'carbs' | 'fat') => {
    if (!dayPlan || !dayPlan.meals) return 0;
    
    let total = 0;
    dayPlan.meals.forEach(meal => {
      if (meal && meal.foods) {
        meal.foods.forEach(food => {
          const foodData = foods.find(f => f.id === food.food_id);
          if (foodData) {
            const factor = food.quantity / (foodData.servingSize || 1);
            switch(nutrient) {
              case 'calories':
                total += (foodData.calories || 0) * factor;
                break;
              case 'protein':
                total += (foodData.protein || 0) * factor;
                break;
              case 'carbs':
                total += (foodData.carbs || 0) * factor;
                break;
              case 'fat':
                total += (foodData.fat || 0) * factor;
                break;
            }
          }
        });
      }
    });
    return Math.round(total);
  };

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

  const getFoodName = (foodId: string) => {
    const food = foods.find(f => f.id === foodId);
    return food ? food.name : "Alimento no encontrado";
  };
  
  const getSupplementName = (supplementId: string) => {
    console.log('Buscando suplemento:', supplementId);
    console.log('Suplementos disponibles:', supplements);
    const supplement = supplements.find(s => s.id === supplementId);
    return supplement ? supplement.name : "Suplemento no encontrado";
  };

  const handleDeletePlan = (planId: string) => {
    onDelete(planId);
  };
  
  const handleViewPlan = (planId: string) => {
    setViewingPlan(planId);
  };
  
  const handleCloseViewPlan = () => {
    setViewingPlan(null);
  };

  const handleExportPlanToPDF = async (planId: string) => {
    const planRef = detailedPlanRefs.current[planId];
    if (!planRef) {
      toast.error("No se pudo encontrar el plan para exportar");
      return;
    }
    
    try {
      setIsLoading(true);
      toast.info("Generando PDF del plan nutricional...");
      
      const plan = plans.find(p => p.id === planId);
      const clientName = plan ? getClientName(plan.clientId).replace(/\s+/g, '_') : 'Cliente';
      const filename = `Plan_Nutricional_${clientName}`;
      
      // Crear un contenedor temporal
      const tempDiv = document.createElement('div');
      tempDiv.className = "pdf-export-container";
      tempDiv.style.width = "1000px";
      tempDiv.style.backgroundColor = "#ffffff";
      tempDiv.style.padding = "40px";
      tempDiv.style.fontFamily = "Arial, sans-serif";
      tempDiv.style.lineHeight = "1.5";
      tempDiv.style.color = "#333333";
      
      // Clonar el contenido del plan con mejoras visuales
      const planContent = planRef.cloneNode(true) as HTMLElement;
      
      // Limpiar el contenido duplicado
      const existingContent = planContent.querySelector('.pdf-export-container');
      if (existingContent) {
        existingContent.remove();
      }
      
      // Mejorar los estilos de las secciones
      const sections = planContent.querySelectorAll('div > div');
      sections.forEach(section => {
        const sectionElement = section as HTMLElement;
        sectionElement.style.marginBottom = '24px';
        sectionElement.style.padding = '16px';
        sectionElement.style.borderRadius = '8px';
        sectionElement.style.backgroundColor = '#f9fafb';
      });
      
      // Mejorar los títulos
      const titles = planContent.querySelectorAll('h2, h3');
      titles.forEach(title => {
        const titleElement = title as HTMLElement;
        titleElement.style.fontWeight = 'bold';
        titleElement.style.marginBottom = '16px';
        titleElement.style.color = '#1a1a1a';
        titleElement.style.borderBottom = '2px solid #e5e7eb';
        titleElement.style.paddingBottom = '8px';
      });
      
      // Mejorar las tablas
      const tables = planContent.querySelectorAll('table');
      tables.forEach(table => {
        const tableElement = table as HTMLElement;
        tableElement.style.width = '100%';
        tableElement.style.borderCollapse = 'collapse';
        tableElement.style.marginBottom = '16px';
        
        const ths = table.querySelectorAll('th');
        ths.forEach(th => {
          const thElement = th as HTMLElement;
          thElement.style.backgroundColor = '#f3f4f6';
          thElement.style.padding = '8px';
          thElement.style.textAlign = 'left';
          thElement.style.borderBottom = '2px solid #e5e7eb';
        });
        
        const tds = table.querySelectorAll('td');
        tds.forEach(td => {
          const tdElement = td as HTMLElement;
          tdElement.style.padding = '8px';
          tdElement.style.borderBottom = '1px solid #e5e7eb';
        });
      });
      
      // Mejorar las tarjetas
      const cards = planContent.querySelectorAll('.card');
      cards.forEach(card => {
        const cardElement = card as HTMLElement;
        cardElement.style.border = '1px solid #e5e7eb';
        cardElement.style.borderRadius = '8px';
        cardElement.style.padding = '16px';
        cardElement.style.marginBottom = '16px';
        cardElement.style.backgroundColor = '#ffffff';
      });
      
      // Mejorar los badges
      const badges = planContent.querySelectorAll('.badge');
      badges.forEach(badge => {
        const badgeElement = badge as HTMLElement;
        badgeElement.style.padding = '4px 8px';
        badgeElement.style.borderRadius = '4px';
        badgeElement.style.fontSize = '12px';
        badgeElement.style.fontWeight = '500';
      });
      
      // Agregar el contenido al contenedor temporal
      tempDiv.appendChild(planContent);
      
      // Agregar el contenedor temporal al documento
      document.body.appendChild(tempDiv);
      
      // Exportar a PDF
      await exportToPDF(tempDiv, filename);
      
      // Limpiar
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getMealDetails = (mealId: string) => {
    return meals.find(meal => meal.id === mealId);
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">
          No hay planes nutricionales creados
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Crea un nuevo plan nutricional para comenzar
        </p>
      </div>
    );
  }

  const currentViewingPlan = plans.find(plan => plan.id === viewingPlan);

  return (
    <div>
      <div style={{ display: 'none' }}>
        {plans.map((plan) => {
          const client = clients.find(c => c.id === plan.clientId);
          
          return (
            <div 
              key={`detailed-${plan.id}`}
              ref={el => detailedPlanRefs.current[plan.id] = el}
              className="bg-white p-8"
              style={{ width: '1000px', padding: '40px' }}
            >
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">{plan.title}</h1>
                <h2 className="text-xl">Plan Nutricional</h2>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold border-b pb-2 mb-3">Información del Cliente</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Nombre:</span> {client?.personalInfo.firstName} {client?.personalInfo.lastName}</p>
                    {client?.personalInfo.birthDate && (
                      <p><span className="font-medium">Fecha de nacimiento:</span> {format(new Date(client.personalInfo.birthDate), "dd/MM/yyyy")}</p>
                    )}
                  </div>
                  <div>
                    <p><span className="font-medium">Altura:</span> {client?.personalInfo.height} cm</p>
                    <p><span className="font-medium">Peso:</span> {client?.weight} kg</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold border-b pb-2 mb-3">Información del Plan</h2>
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
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold border-b pb-2 mb-3">Objetivos y Restricciones</h2>
                
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
              </div>
              
              {plan.nutrientGoals && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b pb-2 mb-3">Objetivos Nutricionales</h2>
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
                </div>
              )}
              
              {plan.hydration && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b pb-2 mb-3">Hidratación</h2>
                  <p><span className="font-medium">Litros de agua recomendados:</span> {plan.hydration.waterLiters} L</p>
                  {plan.hydration.notes && (
                    <p><span className="font-medium">Notas:</span> {plan.hydration.notes}</p>
                  )}
                </div>
              )}
              
              <div className="mb-6">
                <h2 className="text-xl font-bold border-b pb-2 mb-4">Plan de Comidas Diarias</h2>
                
                {plan.dailyPlans.map((dayPlan, dayIndex) => (
                  <div key={dayIndex} className="mb-6 pb-4 border-b last:border-b-0">
                    <h3 className="font-bold text-lg mb-3">Día {dayIndex + 1}</h3>
                    
                    {dayPlan.totalCalories && (
                      <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                        <div>
                          <span className="font-semibold">Calorías: </span>
                          {dayPlan.totalCalories || calculateDayTotal(dayPlan, 'calories')} kcal
                        </div>
                        <div>
                          <span className="font-semibold">Proteínas: </span>
                          {dayPlan.totalProtein || calculateDayTotal(dayPlan, 'protein')} g
                        </div>
                        <div>
                          <span className="font-semibold">Carbohidratos: </span>
                          {dayPlan.totalCarbs || calculateDayTotal(dayPlan, 'carbs')} g
                        </div>
                        <div>
                          <span className="font-semibold">Grasas: </span>
                          {dayPlan.totalFat || calculateDayTotal(dayPlan, 'fat')} g
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {dayPlan.meals?.map((meal, mealIndex) => {
                        const mealDetails = getMealDetails(meal.meal_id || '');
                        if (!mealDetails) return null;
                        
                        return (
                          <Card key={mealIndex} className="mb-4">
                            <CardHeader>
                              <CardTitle>{mealDetails.type || `Comida ${mealIndex + 1}`}</CardTitle>
                              <CardDescription>{mealDetails.time || 'Sin hora especificada'}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-4">
                                {mealDetails.foods?.map((food, foodIndex) => {
                                  const foodData = foods.find(f => f.id === food.food_id);
                                  console.log('Datos del alimento:', {
                                    food,
                                    foodId: food.food_id,
                                    name: foodData?.name,
                                    quantity: food.quantity,
                                    unit: food.unit,
                                    calories: food.calories,
                                    image: foodData?.image_url
                                  });
                                  return (
                                    <div key={foodIndex} className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={foodData?.image_url} alt={foodData?.name || 'Alimento'} />
                                        <AvatarFallback>{foodData?.name?.charAt(0) || 'A'}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{foodData?.name || 'Alimento'}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {food.quantity ? `${food.quantity} ${food.unit}` : foodData?.servingUnit} - {food.calories} kcal
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                                {mealDetails.instructions && (
                                  <div>
                                    <h4 className="font-medium mb-2">Instrucciones de preparación</h4>
                                    <p className="text-sm text-muted-foreground">{mealDetails.instructions}</p>
                                  </div>
                                )}
                                {mealDetails.notes && (
                                  <div>
                                    <h4 className="font-medium mb-2">Notas</h4>
                                    <p className="text-sm text-muted-foreground">{mealDetails.notes}</p>
                                  </div>
                                )}
                                {mealDetails.images && mealDetails.images.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Fotos</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      {mealDetails.images.map((image, imageIndex) => (
                                        <img
                                          key={imageIndex}
                                          src={image}
                                          alt={`Foto ${imageIndex + 1} de ${mealDetails.type || 'comida'}`}
                                          className="rounded-lg object-cover h-32 w-full"
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
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Suplemento</th>
                        <th className="text-right">Dosis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(plan.supplements).map(([supplementId, supplementData]) => (
                        <tr key={supplementId}>
                          <td className="py-1">
                            {getSupplementName(supplementId)}
                          </td>
                          <td className="text-right">{supplementData.dose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {plan.additionalNotes && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold border-b pb-2 mb-3">Notas Adicionales</h2>
                  <p>{plan.additionalNotes}</p>
                </div>
              )}
              
              <div className="text-center text-sm text-gray-500 mt-8">
                <p>Plan generado por THREEPERCENT</p>
                <p>Fecha de generación: {format(new Date(), "dd/MM/yyyy")}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={viewingPlan !== null} onOpenChange={handleCloseViewPlan}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentViewingPlan?.title || "Detalles del Plan Nutricional"}</DialogTitle>
            <DialogDescription>
              {currentViewingPlan && getClientName(currentViewingPlan.clientId)}
            </DialogDescription>
          </DialogHeader>
          
          {currentViewingPlan && (
            <div className="mt-4 space-y-6">
              {/* Información del Cliente */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold border-b pb-2">Información del Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Nombre:</span> {getClientName(currentViewingPlan.clientId)}</p>
                    <p><span className="font-medium">Estado del Plan:</span> 
                      <Badge variant={currentViewingPlan.isActive ? "default" : "secondary"} className="ml-2">
                        {currentViewingPlan.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p><span className="font-medium">Fecha de inicio:</span> {format(new Date(currentViewingPlan.startDate), "dd/MM/yyyy")}</p>
                    {currentViewingPlan.endDate && (
                      <p><span className="font-medium">Fecha de fin:</span> {format(new Date(currentViewingPlan.endDate), "dd/MM/yyyy")}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Objetivos y Restricciones */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold border-b pb-2">Objetivos y Restricciones</h3>
                <div className="grid grid-cols-2 gap-4">
                  {currentViewingPlan.objectives && currentViewingPlan.objectives.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-1">Objetivos:</h4>
                      <ul className="list-disc pl-5">
                        {currentViewingPlan.objectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {currentViewingPlan.restrictions && currentViewingPlan.restrictions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-1">Restricciones:</h4>
                      <ul className="list-disc pl-5">
                        {currentViewingPlan.restrictions.map((restriction, idx) => (
                          <li key={idx}>{restriction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Objetivos Nutricionales */}
              {currentViewingPlan.nutrientGoals && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold border-b pb-2">Objetivos Nutricionales Diarios</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {currentViewingPlan.nutrientGoals.calories && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-semibold">Calorías</p>
                        <p>{currentViewingPlan.nutrientGoals.calories} kcal</p>
                      </div>
                    )}
                    {currentViewingPlan.nutrientGoals.protein && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-semibold">Proteínas</p>
                        <p>{currentViewingPlan.nutrientGoals.protein} g</p>
                      </div>
                    )}
                    {currentViewingPlan.nutrientGoals.carbs && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-semibold">Carbohidratos</p>
                        <p>{currentViewingPlan.nutrientGoals.carbs} g</p>
                      </div>
                    )}
                    {currentViewingPlan.nutrientGoals.fat && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-semibold">Grasas</p>
                        <p>{currentViewingPlan.nutrientGoals.fat} g</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hidratación */}
              {currentViewingPlan.hydration && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold border-b pb-2">Hidratación</h3>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="font-semibold">Recomendación diaria de agua</p>
                    <p>{(currentViewingPlan.hydration.daily_goal / 1000).toFixed(1)} litros</p>
                    {currentViewingPlan.hydration.reminders && currentViewingPlan.hydration.reminders.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold">Recordatorios:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {currentViewingPlan.hydration.reminders.map((time, index) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentViewingPlan.hydration.notes && (
                      <div className="mt-2">
                        <p className="font-semibold">Notas:</p>
                        <p className="text-sm text-muted-foreground">{currentViewingPlan.hydration.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Suplementos */}
              {currentViewingPlan?.supplements && Object.keys(currentViewingPlan.supplements).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold border-b pb-2">Suplementos Recomendados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(currentViewingPlan.supplements).map(([supplementId, supplementData]) => {
                      const supplement = supplements.find(s => s.id === supplementId);
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
                                    <span className="font-medium">Dosis:</span> {supplementData.dose}
                                  </p>
                                  {supplementData.time && (
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">Horario:</span> {supplementData.time}
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

              {/* Plan de Comidas */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold border-b pb-2">Plan de Comidas</h3>
                {currentViewingPlan.dailyPlans.map((dayPlan, dayIndex) => (
                  <div key={dayIndex} className="border rounded-lg p-4 mb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <h4 className="font-semibold text-lg mb-2 md:mb-0">Día {dayIndex + 1}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                        <div className="bg-muted p-2 rounded-lg">
                          <span className="font-medium block">Calorías</span>
                          <span className="text-sm">{calculateDayTotal(dayPlan, 'calories')} kcal</span>
                        </div>
                        <div className="bg-muted p-2 rounded-lg">
                          <span className="font-medium block">Proteínas</span>
                          <span className="text-sm">{calculateDayTotal(dayPlan, 'protein')} g</span>
                        </div>
                        <div className="bg-muted p-2 rounded-lg">
                          <span className="font-medium block">Carbos</span>
                          <span className="text-sm">{calculateDayTotal(dayPlan, 'carbs')} g</span>
                        </div>
                        <div className="bg-muted p-2 rounded-lg">
                          <span className="font-medium block">Grasas</span>
                          <span className="text-sm">{calculateDayTotal(dayPlan, 'fat')} g</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {dayPlan.meals?.map((meal, mealIndex) => {
                        const mealDetails = getMealDetails(meal.meal_id || '');
                        if (!mealDetails) return null;
                        
                        return (
                          <Card key={mealIndex} className="mb-4">
                            <CardHeader>
                              <CardTitle>{mealDetails.type || `Comida ${mealIndex + 1}`}</CardTitle>
                              <CardDescription>{mealDetails.time || 'Sin hora especificada'}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-4">
                                {mealDetails.foods?.map((food, foodIndex) => {
                                  const foodData = foods.find(f => f.id === food.food_id);
                                  console.log('Datos del alimento:', {
                                    food,
                                    foodId: food.food_id,
                                    name: foodData?.name,
                                    quantity: food.quantity,
                                    unit: food.unit,
                                    calories: food.calories,
                                    image: foodData?.image_url
                                  });
                                  return (
                                    <div key={foodIndex} className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={foodData?.image_url} alt={foodData?.name || 'Alimento'} />
                                        <AvatarFallback>{foodData?.name?.charAt(0) || 'A'}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{foodData?.name || 'Alimento'}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {food.quantity ? `${food.quantity} ${food.unit}` : foodData?.servingUnit} - {food.calories} kcal
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                                {mealDetails.instructions && (
                                  <div>
                                    <h4 className="font-medium mb-2">Instrucciones de preparación</h4>
                                    <p className="text-sm text-muted-foreground">{mealDetails.instructions}</p>
                                  </div>
                                )}
                                {mealDetails.notes && (
                                  <div>
                                    <h4 className="font-medium mb-2">Notas</h4>
                                    <p className="text-sm text-muted-foreground">{mealDetails.notes}</p>
                                  </div>
                                )}
                                {mealDetails.images && mealDetails.images.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Fotos</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      {mealDetails.images.map((image, imageIndex) => (
                                        <img
                                          key={imageIndex}
                                          src={image}
                                          alt={`Foto ${imageIndex + 1} de ${mealDetails.type || 'comida'}`}
                                          className="rounded-lg object-cover h-32 w-full"
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

              {/* Notas Adicionales */}
              {currentViewingPlan.additionalNotes && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold border-b pb-2">Notas Adicionales</h3>
                  <p className="text-sm text-muted-foreground">{currentViewingPlan.additionalNotes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => {
                if (currentViewingPlan) {
                  handleExportPlanToPDF(currentViewingPlan.id);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? "Generando PDF..." : "Exportar a PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            ref={el => planRefs.current[plan.id] = el}
          >
            <Card className="overflow-hidden flex flex-col">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{plan.title}</CardTitle>
                    <CardDescription>
                      {getClientName(plan.clientId)}
                    </CardDescription>
                  </div>
                  <Badge variant={plan.isActive ? "default" : "outline"}>
                    {plan.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {format(new Date(plan.startDate), "dd/MM/yyyy")}
                    {plan.endDate && ` - ${format(new Date(plan.endDate), "dd/MM/yyyy")}`}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Días:</span> {plan.dailyPlans.length}
                  </div>
                  {plan.nutrientGoals?.calories && (
                    <div className="text-sm">
                      <span className="font-medium">Calorías objetivo:</span> {plan.nutrientGoals.calories} kcal
                    </div>
                  )}
                  {plan.objectives && plan.objectives.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plan.objectives.slice(0, 3).map((obj, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {obj}
                        </Badge>
                      ))}
                      {plan.objectives.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.objectives.length - 3} más
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewPlan(plan.id)}
                >
                  <Eye size={16} className="mr-1" /> Ver Plan
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  <Trash size={16} className="mr-1" /> Eliminar
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionPlanList;
