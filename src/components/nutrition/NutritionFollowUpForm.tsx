import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";

import { useData } from "@/context/DataContext";

interface NutritionFollowUpFormProps {
  initialData?: any;
  onComplete?: () => void;
  onSuccess?: () => void;
}

const followUpSchema = z.object({
  clientId: z.string().min(1, "Selecciona un cliente"),
  planId: z.string().min(1, "Selecciona un plan"),
  date: z.date({
    required_error: "Selecciona una fecha",
  }),
  mood: z.enum(["good", "normal", "bad"], {
    required_error: "Selecciona un estado de ánimo",
  }),
  weight: z.number().optional(),
  notes: z.string().optional(),
  completedMeals: z.array(z.object({
    mealId: z.string(),
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    notes: z.string()
  })).default([])
});

type FollowUpFormData = z.infer<typeof followUpSchema>;

interface ClientProfile {
  first_name: string;
  last_name: string;
}

interface Client {
  id: string;
  profile_id: string;
  profiles: ClientProfile;
}

interface FormattedClient {
  id: string;
  name: string;
}

interface NutritionPlan {
  id: string;
  title: string;
  clientId: string;
}

export const NutritionFollowUpForm: React.FC<NutritionFollowUpFormProps> = ({
  initialData,
  onComplete,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState<FormattedClient[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadClients();
    if (initialData) {
      loadNutritionPlans(initialData.clientId);
    }
  }, [initialData]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          profile_id,
          nutritionist_id,
          profiles (
            name
          )
        `)
        .order('profiles(name)', { ascending: true });

      if (error) {
        console.error('Error al cargar clientes:', error);
        throw error;
      }

      console.log('Todos los clientes en la base de datos:', data);

      if (!data || data.length === 0) {
        console.log('No se encontraron clientes');
        toast.warning("No se encontraron clientes en el sistema");
        return;
      }

      const formattedClients: FormattedClient[] = data.map((client: any) => {
        console.log('Cliente mapeado:', { id: client.id, name: client.profiles.name });
        return {
          id: client.id,
          name: client.profiles.name
        };
      });

      setClients(formattedClients);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error("Error al cargar los clientes");
    }
  };

  const loadNutritionPlans = async (clientId: string) => {
    try {
      console.log('Cargando planes para cliente:', clientId);
      
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select(`
          id,
          title,
          client_id
        `)
        .eq('client_id', clientId);

      if (error) {
        console.error('Error en la consulta:', error);
        throw error;
      }

      console.log('Planes encontrados:', data);

      const formattedPlans = data.map(plan => ({
        id: plan.id,
        title: plan.title,
        clientId: plan.client_id
      }));

      setNutritionPlans(formattedPlans);
    } catch (error) {
      console.error('Error al cargar planes nutricionales:', error);
      toast.error('Error al cargar los planes nutricionales');
    }
  };

  const form = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      clientId: initialData?.clientId || "",
      planId: initialData?.planId || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      mood: initialData?.mood || undefined,
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = async (values: FollowUpFormData) => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para realizar esta acción");
      return;
    }

    setIsLoading(true);

    try {
      console.log('ID del cliente seleccionado:', values.clientId);
      console.log('Todos los clientes disponibles:', clients);

      // Verificar que el cliente existe en nuestra lista local
      const selectedClient = clients.find(c => c.id === values.clientId);
      if (!selectedClient) {
        throw new Error(`El cliente con ID ${values.clientId} no está en la lista de clientes disponibles`);
      }

      // Verificar que el cliente existe en la base de datos
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, profile_id, nutritionist_id')
        .eq('id', values.clientId)
        .single();

      if (clientError) {
        console.error('Error al verificar cliente:', clientError);
        throw new Error(`Error al verificar cliente: ${clientError.message}`);
      }

      if (!clientData) {
        console.error('Cliente no encontrado con ID:', values.clientId);
        throw new Error(`No se encontró el cliente con ID: ${values.clientId}`);
      }

      console.log('Cliente encontrado en la base de datos:', clientData);

      // Verificar que el plan existe
      const { data: planData, error: planError } = await supabase
        .from('nutrition_plans')
        .select('id, client_id')
        .eq('id', values.planId)
        .single();

      if (planError) {
        console.error('Error al verificar plan:', planError);
        throw new Error(`Error al verificar plan: ${planError.message}`);
      }

      if (!planData) {
        console.error('Plan no encontrado con ID:', values.planId);
        throw new Error(`No se encontró el plan con ID: ${values.planId}`);
      }

      console.log('Plan encontrado:', planData);

      // Verificar que el plan pertenece al cliente
      if (planData.client_id !== values.clientId) {
        throw new Error('El plan seleccionado no pertenece al cliente');
      }

      const followUpData = {
        client_id: values.clientId,
        plan_id: values.planId,
        date: values.date.toISOString(),
        mood: values.mood,
        weight: values.weight || 0,
        body_fat: 0,
        notes: values.notes || '',
        completed_meals: values.completedMeals || [],
        created_by: currentUser.id
      };

      console.log('Datos a guardar:', followUpData);

      if (initialData) {
        // Actualizar seguimiento
        const { error: updateError } = await supabase
          .from('nutrition_follow_ups')
          .update(followUpData)
          .eq('id', initialData.id);

        if (updateError) throw updateError;
        toast.success("Seguimiento actualizado correctamente");
      } else {
        // Crear nuevo seguimiento
        const { error: insertError } = await supabase
          .from('nutrition_follow_ups')
          .insert(followUpData);

        if (insertError) throw insertError;
        toast.success("Seguimiento creado correctamente");
      }

      if (onComplete) onComplete();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al guardar el seguimiento:', error);
      toast.error(error instanceof Error ? error.message : "Error al guardar el seguimiento");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar planes nutricionales por cliente seleccionado
  const availablePlans = form.watch("clientId") 
    ? nutritionPlans.filter(plan => plan.clientId === form.watch("clientId"))
    : [];

  // Agregar este useEffect para cargar los planes cuando se selecciona un cliente
  useEffect(() => {
    const selectedClientId = form.watch("clientId");
    if (selectedClientId) {
      loadNutritionPlans(selectedClientId);
    }
  }, [form.watch("clientId")]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
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
          name="planId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Nutricional</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!form.watch("clientId")}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plan nutricional" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.title}
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
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2020-01-01")
                    }
                    locale={es}
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
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado de ánimo</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="good" id="mood-good" />
                  </FormControl>
                  <FormLabel htmlFor="mood-good">Bueno</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="normal" id="mood-normal" />
                  </FormControl>
                  <FormLabel htmlFor="mood-normal">Normal</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="bad" id="mood-bad" />
                  </FormControl>
                  <FormLabel htmlFor="mood-bad">Malo</FormLabel>
                </FormItem>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas sobre el seguimiento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>Guardar</Button>
      </form>
    </Form>
  );
};

export default NutritionFollowUpForm;
