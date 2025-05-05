import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Trash, X, Pill, Droplet } from "lucide-react";
import { DailyPlanSection } from "./DailyPlanSection";
import { SupplementSelector } from "./SupplementSelector";
import { toast } from "@/lib/toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DailyPlan, Food, RecommendedSupplement } from "@/types";
import { supabase } from "@/lib/supabase";

const nutritionPlanSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  clientId: z.string().min(1, "Debe seleccionar un cliente"),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  dailyPlans: z.array(
    z.object({
      day: z.number(),
      meals: z.array(
        z.object({
          type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
          time: z.string().optional(),
          foods: z.array(
            z.object({
              foodId: z.string(),
              quantity: z.number()
            })
          ).optional(),
          instructions: z.string().optional(),
          notes: z.string().optional(),
          images: z.array(z.string()).optional()
        })
      ),
      totalCalories: z.number().optional(),
      totalProtein: z.number().optional(),
      totalCarbs: z.number().optional(),
      totalFat: z.number().optional()
    })
  ),
  isActive: z.boolean(),
  nutrientGoals: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional()
  }),
  hydration: z.object({
    waterLiters: z.number().min(0, "No puede ser un valor negativo"),
    notes: z.string().optional()
  }),
  restrictions: z.array(z.string()),
  preferences: z.array(z.string()),
  allergies: z.array(z.string()),
  objectives: z.array(z.string()),
  additionalNotes: z.string().optional(),
  supplements: z.array(
    z.object({
      supplementId: z.string(),
      dosage: z.string(),
      name: z.string().optional(),
      time: z.string().optional()
    })
  ).optional()
});

type NutritionPlanFormValues = z.infer<typeof nutritionPlanSchema>;

interface NutritionPlanFormProps {
  plan?: any;
  onCancel: () => void;
}

interface ClientProfile {
  name: string;
  email: string;
}

interface Client {
  id: string;
  profile_id: string;
  profiles: ClientProfile;
}

interface FormattedClient {
  id: string;
  name: string;
  email: string;
}

const NutritionPlanForm = ({ plan, onCancel }: NutritionPlanFormProps) => {
  const { clients: initialClients, addNutritionPlan, updateNutritionPlan, foods } = useData();
  const { currentUser } = useAuth();
  const [selectedDay, setSelectedDay] = useState(1);
  const [formattedClients, setFormattedClients] = useState<FormattedClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const defaultValues: NutritionPlanFormValues = {
    title: plan?.title || "",
    clientId: plan?.clientId || "",
    description: plan?.description || "",
    startDate: plan?.startDate ? new Date(plan.startDate) : new Date(),
    endDate: plan?.endDate ? new Date(plan.endDate) : undefined,
    dailyPlans: plan?.dailyPlans || [{ day: 1, meals: [] }],
    isActive: plan?.isActive !== undefined ? plan.isActive : true,
    nutrientGoals: {
      calories: plan?.nutrientGoals?.calories || undefined,
      protein: plan?.nutrientGoals?.protein || undefined,
      carbs: plan?.nutrientGoals?.carbs || undefined,
      fat: plan?.nutrientGoals?.fat || undefined
    },
    hydration: {
      waterLiters: plan?.hydration?.waterLiters || 2,
      notes: plan?.hydration?.notes || ""
    },
    restrictions: plan?.restrictions || [],
    preferences: plan?.preferences || [],
    allergies: plan?.allergies || [],
    objectives: plan?.objectives || [],
    additionalNotes: plan?.additionalNotes || "",
    supplements: plan?.supplements || []
  };

  const form = useForm<NutritionPlanFormValues>({
    resolver: zodResolver(nutritionPlanSchema),
    defaultValues
  });

  const { fields: daysFields, append: appendDay } = useFieldArray({
    control: form.control,
    name: "dailyPlans"
  });

  const calculateMealNutrition = (mealFoods: { foodId: string, quantity: number }[]) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    mealFoods.forEach(({ foodId, quantity }) => {
      const food = foods.find(f => f.id === foodId);
      if (food) {
        const factor = quantity / food.servingSize;
        totalCalories += food.calories * factor;
        totalProtein += food.protein * factor;
        totalCarbs += food.carbs * factor;
        totalFat += food.fat * factor;
      }
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat)
    };
  };

  const processDailyPlans = (rawDailyPlans: any[]): DailyPlan[] => {
    return rawDailyPlans.map(day => {
      let dayTotalCalories = 0;
      let dayTotalProtein = 0;
      let dayTotalCarbs = 0;
      let dayTotalFat = 0;

      const meals = day.meals?.map(meal => {
        const mealNutrition = calculateMealNutrition(meal.foods || []);
        
        dayTotalCalories += mealNutrition.calories;
        dayTotalProtein += mealNutrition.protein;
        dayTotalCarbs += mealNutrition.carbs;
        dayTotalFat += mealNutrition.fat;

        return meal;
      }) || [];

      return {
        day: day.day,
        meals: meals,
        totalCalories: dayTotalCalories,
        totalProtein: dayTotalProtein,
        totalCarbs: dayTotalCarbs,
        totalFat: dayTotalFat
      };
    });
  };

  const onSubmit = async (data: NutritionPlanFormValues) => {
    try {
      // Obtener el ID del nutricionista
      const { data: nutritionistData, error: nutritionistError } = await supabase
        .from('nutritionists')
        .select('id')
        .eq('profile_id', currentUser?.id)
        .single();

      if (nutritionistError) throw nutritionistError;
      if (!nutritionistData) throw new Error('No se encontró el nutricionista');

      // Primero, guardar todas las comidas
      const mealPromises = data.dailyPlans.flatMap(dayPlan =>
        dayPlan.meals.map(async meal => {
          const mealData = {
            id: crypto.randomUUID(),
            name: `${meal.type === "breakfast" ? "Desayuno" : 
                   meal.type === "lunch" ? "Almuerzo" : 
                   meal.type === "dinner" ? "Cena" : "Merienda"} - Día ${dayPlan.day}`,
            type: meal.type,
            foods: meal.foods?.map(food => {
              const foodData = foods.find(f => f.id === food.foodId);
              if (!foodData) {
                console.error('No se encontró el alimento:', food.foodId);
                return null;
              }
              return {
                food_id: food.foodId,
                quantity: food.quantity,
                unit: foodData.servingUnit || 'g',
                calories: foodData.calories * (food.quantity / foodData.servingSize),
                food: {
                  food_id: food.foodId,
                  name: foodData.name,
                  calories: foodData.calories,
                  protein: foodData.protein,
                  carbs: foodData.carbs,
                  fat: foodData.fat,
                  portion: `${food.quantity}${foodData.servingUnit || 'g'}`,
                  image_url: foodData.image_url
                }
              };
            }).filter(Boolean),
            instructions: meal.notes || '',
            image_url: meal.images?.[0] || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: savedMeal, error: mealError } = await supabase
            .from('meals')
            .insert(mealData)
            .select()
            .single();

          if (mealError) throw mealError;
          return { ...meal, id: savedMeal.id };
        })
      );

      // Esperar a que todas las comidas se guarden
      const savedMeals = await Promise.all(mealPromises);

      // Formatear los planes diarios con las referencias a las comidas guardadas
      const formattedDailyPlans = data.dailyPlans.map((day, dayIndex) => ({
        day: day.day,
        meals: day.meals.map((meal, mealIndex) => ({
          meal_id: savedMeals[dayIndex * day.meals.length + mealIndex].id,
          type: meal.type,
          time: meal.time || '',
          foods: meal.foods || [],
          instructions: meal.instructions || '',
          notes: meal.notes || '',
          images: meal.images || []
        })),
        totalCalories: calculateDayTotal(day, 'calories'),
        totalProtein: calculateDayTotal(day, 'protein'),
        totalCarbs: calculateDayTotal(day, 'carbs'),
        totalFat: calculateDayTotal(day, 'fat')
      }));

      const planData = {
        client_id: data.clientId,
        nutritionist_id: nutritionistData.id,
        title: data.title,
        start_date: data.startDate.toISOString().split('T')[0],
        end_date: data.endDate ? data.endDate.toISOString().split('T')[0] : null,
        daily_plans: formattedDailyPlans,
        notes: data.description,
        is_active: data.isActive,
        nutrient_goals: {
          calories: data.nutrientGoals.calories,
          protein: data.nutrientGoals.protein,
          carbs: data.nutrientGoals.carbs,
          fat: data.nutrientGoals.fat
        },
        hydration: {
          reminders: ["08:00", "12:00", "16:00", "20:00"],
          daily_goal: data.hydration.waterLiters * 1000
        },
        restrictions: data.restrictions,
        preferences: data.preferences,
        allergies: data.allergies,
        objectives: data.objectives,
        additional_notes: data.additionalNotes,
        description: data.description,
        supplements: data.supplements?.reduce((acc, supp) => {
          acc[supp.supplementId] = {
            dose: supp.dosage,
            name: supp.name || "",
            time: supp.time || "mañana"
          };
          return acc;
        }, {})
      };

      if (plan) {
        const { error: updateError } = await supabase
          .from('nutrition_plans')
          .update(planData)
          .eq('id', plan.id);

        if (updateError) throw updateError;
      } else {
        const { data: newPlan, error: insertError } = await supabase
          .from('nutrition_plans')
          .insert(planData)
          .select()
          .single();

        if (insertError) throw insertError;
      }

      toast.success("Plan nutricional guardado con éxito");
      onCancel();
    } catch (error) {
      console.error("Error al guardar el plan:", error);
      toast.error("Error al guardar el plan nutricional");
    }
  };

  // Función auxiliar para calcular los totales nutricionales
  const calculateDayTotal = (day: any, nutrient: 'calories' | 'protein' | 'carbs' | 'fat') => {
    let total = 0;
    day.meals?.forEach(meal => {
      meal.foods?.forEach(food => {
        const foodData = foods.find(f => f.id === food.foodId);
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
    });
    return Math.round(total);
  };

  const handleAddDay = () => {
    appendDay({
      day: daysFields.length + 1,
      meals: []
    });
    setSelectedDay(daysFields.length + 1);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        console.log('Iniciando carga de clientes...');
        
        const { data, error } = await supabase
          .from('clients')
          .select(`
            id,
            profile_id,
            profiles (
              name,
              email
            )
          `);

        if (error) throw error;
        
        const clients: FormattedClient[] = data?.map(client => {
          const profile = client.profiles as unknown as ClientProfile;
          return {
            id: client.id,
            name: profile?.name || 'Sin nombre',
            email: profile?.email || 'Sin email'
          };
        }) || [];

        setFormattedClients(clients);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        toast.error('Error al cargar la lista de clientes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [plan]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          <div className="space-y-8 px-1">
            <div>
              <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Cargando clientes..." : "Seleccione un cliente"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formattedClients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} ({client.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Plan de pérdida de peso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa el propósito y objetivos generales del plan..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">Plan de Comidas</h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {daysFields.map((field, index) => (
                  <Badge 
                    key={field.id}
                    variant={selectedDay === index + 1 ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedDay(index + 1)}
                  >
                    Día {index + 1}
                  </Badge>
                ))}
                <Badge 
                  variant="outline" 
                  className="cursor-pointer bg-muted/50"
                  onClick={handleAddDay}
                >
                  <Plus className="h-3 w-3 mr-1" /> Añadir día
                </Badge>
              </div>

              {daysFields.map((dayField, dayIndex) => (
                <div 
                  key={dayField.id} 
                  className={cn(
                    "space-y-4",
                    selectedDay !== dayIndex + 1 && "hidden"
                  )}
                >
                  <DailyPlanSection 
                    dayIndex={dayIndex}
                    control={form.control}
                  />
                </div>
              ))}
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">Suplementos Recomendados</h2>
              <SupplementSelector 
                control={form.control}
                fieldName="supplements"
              />
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">Objetivos Nutricionales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Calorías Diarias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="nutrientGoals.calories"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ej. 2000" 
                                {...field}
                                value={field.value || ''}
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <span>kcal</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Macronutrientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="nutrientGoals.protein"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel className="min-w-[70px]">Proteína</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="g" 
                                  {...field}
                                  value={field.value || ''}
                                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <span>g</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nutrientGoals.carbs"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel className="min-w-[70px]">Carbos</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="g" 
                                  {...field}
                                  value={field.value || ''}
                                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <span>g</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nutrientGoals.fat"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel className="min-w-[70px]">Grasas</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="g" 
                                  {...field}
                                  value={field.value || ''}
                                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <span>g</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">Hidratación</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Droplet className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-medium">Recomendación de agua diaria</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="hydration.waterLiters"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Litros de agua diarios</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1"
                                placeholder="2.0" 
                                {...field}
                                value={field.value || ''}
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                              />
                            </FormControl>
                            <span>L</span>
                          </div>
                          <FormDescription>
                            Cantidad de agua recomendada por día
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hydration.notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Notas sobre hidratación</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ej: Tomar un vaso de agua al despertar..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Consejos específicos sobre hidratación
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">Restricciones y Preferencias</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restricciones Alimentarias</FormLabel>
                      <div className="flex flex-wrap gap-2 border rounded-md p-3 min-h-[80px]">
                        {field.value.map((item, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {item}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => {
                                const newValue = [...field.value];
                                newValue.splice(index, 1);
                                field.onChange(newValue);
                              }}
                            />
                          </Badge>
                        ))}
                        <Input
                          className="w-full mt-2"
                          placeholder="Añadir restricción y presionar Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const target = e.target as HTMLInputElement;
                              if (target.value) {
                                field.onChange([...field.value, target.value]);
                                target.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alergias</FormLabel>
                      <div className="flex flex-wrap gap-2 border rounded-md p-3 min-h-[80px]">
                        {field.value.map((item, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {item}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => {
                                const newValue = [...field.value];
                                newValue.splice(index, 1);
                                field.onChange(newValue);
                              }}
                            />
                          </Badge>
                        ))}
                        <Input
                          className="w-full mt-2"
                          placeholder="Añadir alergia y presionar Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const target = e.target as HTMLInputElement;
                              if (target.value) {
                                field.onChange([...field.value, target.value]);
                                target.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferencias Alimentarias</FormLabel>
                      <div className="flex flex-wrap gap-2 border rounded-md p-3 min-h-[80px]">
                        {field.value.map((item, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {item}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => {
                                const newValue = [...field.value];
                                newValue.splice(index, 1);
                                field.onChange(newValue);
                              }}
                            />
                          </Badge>
                        ))}
                        <Input
                          className="w-full mt-2"
                          placeholder="Añadir preferencia y presionar Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const target = e.target as HTMLInputElement;
                              if (target.value) {
                                field.onChange([...field.value, target.value]);
                                target.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivos</FormLabel>
                      <div className="flex flex-wrap gap-2 border rounded-md p-3 min-h-[80px]">
                        {field.value.map((item, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {item}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => {
                                const newValue = [...field.value];
                                newValue.splice(index, 1);
                                field.onChange(newValue);
                              }}
                            />
                          </Badge>
                        ))}
                        <Input
                          className="w-full mt-2"
                          placeholder="Añadir objetivo y presionar Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const target = e.target as HTMLInputElement;
                              if (target.value) {
                                field.onChange([...field.value, target.value]);
                                target.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">Fechas y Estado</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Inicio</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Seleccione una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Fin</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Seleccione una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "true")}
                        defaultValue={field.value ? "true" : "false"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Activo</SelectItem>
                          <SelectItem value="false">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Adicionales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Notas adicionales sobre el plan..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="h-4"></div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-4 pt-4 border-t sticky bottom-0 bg-background">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {plan ? "Actualizar plan" : "Crear plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NutritionPlanForm;
