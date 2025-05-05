import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar as CalendarIcon, Plus, X, Trash } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TrainingPlan } from "@/types";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  clientId: z.string().min(1, { message: "Debe seleccionar un cliente" }),
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
  description: z.string().optional(),
  startDate: z.date({ required_error: "Debe seleccionar una fecha de inicio" }),
  endDate: z.date().optional(),
  status: z.enum(["active", "completed", "draft"]),
});

type FormValues = z.infer<typeof formSchema>;

interface TrainingPlanFormProps {
  onClose: () => void;
  planId?: string;
}

interface Client {
  id: string;
  name: string;
}

interface TrainingRoutine {
  id: string;
  day: string;
  exercises: string;
}

export function TrainingPlanForm({ onClose, planId }: TrainingPlanFormProps) {
  const { currentUser } = useAuth();
  const { refreshTrainingPlans } = useData();
  const [clients, setClients] = useState<Client[]>([]);
  const [routines, setRoutines] = useState<TrainingRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "active",
    },
  });

  useEffect(() => {
    loadClients();
    if (planId) {
      loadPlan(planId);
    }
  }, [planId]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          profile_id,
          profiles!clients_profile_id_fkey (
            name
          )
        `);

      if (error) throw error;

      const formattedClients = data.map(client => ({
        id: client.profile_id,
        name: client.profiles?.name || 'Cliente sin nombre'
      }));

      setClients(formattedClients);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar los clientes');
    }
  };

  const loadPlan = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          clientId: data.client_id,
          title: data.title,
          description: data.description,
          startDate: new Date(data.start_date),
          endDate: data.end_date ? new Date(data.end_date) : undefined,
          status: data.status,
        });
        setRoutines(data.routines);
      }
    } catch (error) {
      console.error('Error al cargar el plan:', error);
      toast.error('Error al cargar el plan');
    }
  };

  const handleAddRoutine = () => {
    setRoutines([
      ...routines,
      {
        id: crypto.randomUUID(),
        day: "monday",
        exercises: "",
      },
    ]);
  };

  const handleRemoveRoutine = (index: number) => {
    setRoutines(routines.filter((_, i) => i !== index));
  };

  const handleRoutineChange = (
    index: number,
    field: keyof TrainingRoutine,
    value: string
  ) => {
    const newRoutines = [...routines];
    newRoutines[index] = {
      ...newRoutines[index],
      [field]: value,
    };
    setRoutines(newRoutines);
  };

  const onSubmit = async (data: FormValues) => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para realizar esta acción");
      return;
    }

    if (routines.length === 0) {
      form.setError("root", {
        type: "manual",
        message: "Debe agregar al menos una rutina",
      });
      return;
    }

    setIsLoading(true);

    try {
      const planData = {
        client_id: data.clientId,
        trainer_id: currentUser.id,
        title: data.title,
        description: data.description,
        start_date: data.startDate.toISOString(),
        end_date: data.endDate ? data.endDate.toISOString() : null,
        status: data.status,
        routines: routines,
      };

      if (planId) {
        const { error } = await supabase
          .from('training_plans')
          .update(planData)
          .eq('id', planId);

        if (error) throw error;
        toast.success("Plan actualizado correctamente");
      } else {
        const { error } = await supabase
          .from('training_plans')
          .insert(planData);

        if (error) throw error;
        toast.success("Plan creado correctamente");
      }

      await refreshTrainingPlans();
      onClose();
    } catch (error) {
      console.error('Error al guardar el plan:', error);
      toast.error("Error al guardar el plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una opción" />
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
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
                    <Input placeholder="Título del plan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del plan"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium">Rutinas</h3>
          <div className="space-y-4 mt-4">
            {routines.map((routine, index) => (
              <div
                key={routine.id}
                className="border rounded-md p-4 relative"
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveRoutine(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel>Día*</FormLabel>
                    <Select
                      value={routine.day}
                      onValueChange={(value) =>
                        handleRoutineChange(index, "day", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Lunes</SelectItem>
                        <SelectItem value="tuesday">Martes</SelectItem>
                        <SelectItem value="wednesday">Miércoles</SelectItem>
                        <SelectItem value="thursday">Jueves</SelectItem>
                        <SelectItem value="friday">Viernes</SelectItem>
                        <SelectItem value="saturday">Sábado</SelectItem>
                        <SelectItem value="sunday">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Ejercicios*</FormLabel>
                    <Textarea
                      placeholder="Ejercicios para este día"
                      value={routine.exercises}
                      onChange={(e) =>
                        handleRoutineChange(index, "exercises", e.target.value)
                      }
                      className="h-24"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              onClick={handleAddRoutine}
              className="w-full flex items-center justify-center"
            >
              <Plus className="mr-2 h-4 w-4" /> Añadir rutina
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium">Fechas y Estado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de inicio*</FormLabel>
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
                            format(field.value, "dd/MM/yyyy", { locale: es })
                          ) : (
                            <span>dd / mm / aaaa</span>
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
                  <FormLabel>Fecha de fin</FormLabel>
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
                            format(field.value, "dd/MM/yyyy", { locale: es })
                          ) : (
                            <span>dd / mm / aaaa</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) =>
                          form.getValues("startDate") &&
                          date < form.getValues("startDate")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {form.formState.errors.root && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="flex space-x-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : (planId ? "Actualizar" : "Crear")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
