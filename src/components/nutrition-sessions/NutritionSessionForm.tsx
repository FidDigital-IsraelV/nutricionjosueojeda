import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NutritionSession } from "@/types";

// Schema para validación
const formSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  startDateTime: z.string().min(1, "La fecha y hora de inicio son requeridas"),
  endDateTime: z.string().min(1, "La fecha y hora de finalización son requeridas"),
  zoomLink: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  maxPatients: z.number().min(1, "Debe ser al menos 1"),
  status: z.enum(["programada", "completada", "cancelada"]),
  patients: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NutritionSessionFormProps {
  session?: NutritionSession;
  mode?: 'create' | 'edit';
}

interface Client {
  id: string;
  name: string;
}

export const NutritionSessionForm: React.FC<NutritionSessionFormProps> = ({
  session,
  mode = 'create'
}) => {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
    if (session) {
      loadSessionPatients(session.id);
    }
  }, [session]);

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

  const loadSessionPatients = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('nutrition_session_patients')
        .select('patient_id')
        .eq('session_id', sessionId);

      if (error) throw error;

      if (data) {
        form.setValue('patients', data.map(item => item.patient_id));
      }
    } catch (error) {
      console.error('Error al cargar pacientes de la sesión:', error);
    }
  };

  const defaultValues: Partial<FormValues> = session ? {
    title: session.title,
    description: session.description,
    startDateTime: new Date(session.startDateTime).toISOString().slice(0, 16),
    endDateTime: new Date(session.endDateTime).toISOString().slice(0, 16),
    zoomLink: session.zoomLink || "",
    maxPatients: session.maxPatients,
    status: session.status,
    patients: session.patients,
  } : {
    title: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    zoomLink: "",
    maxPatients: 1,
    status: "programada",
    patients: [],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para realizar esta acción");
      return;
    }

    setIsLoading(true);

    try {
      // Obtener el ID del nutricionista
      const { data: nutritionistData, error: nutritionistError } = await supabase
        .from('nutritionists')
        .select('id')
        .eq('profile_id', currentUser.id)
        .single();

      if (nutritionistError) throw nutritionistError;
      if (!nutritionistData) {
        throw new Error("No se encontró el nutricionista");
      }

      const sessionData = {
        title: values.title,
        description: values.description,
        start_date_time: values.startDateTime,
        end_date_time: values.endDateTime,
        zoom_link: values.zoomLink || null,
        max_patients: values.maxPatients,
        status: values.status,
        nutritionist_id: nutritionistData.id,
        patients: values.patients || []
      };

      if (mode === 'edit' && session) {
        // Actualizar sesión
        const { error: updateError } = await supabase
          .from('nutrition_sessions')
          .update(sessionData)
          .eq('id', session.id);

        if (updateError) throw updateError;
        toast.success("Sesión actualizada correctamente");
      } else {
        // Crear nueva sesión
        const { error: insertError } = await supabase
          .from('nutrition_sessions')
          .insert(sessionData);

        if (insertError) throw insertError;
        toast.success("Sesión creada correctamente");
      }

      navigate('/sesiones-nutricion');
    } catch (error) {
      console.error('Error al guardar la sesión:', error);
      toast.error("Error al guardar la sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Información de la Sesión</h2>
          <p className="text-gray-600 mb-6">Detalles de la sesión de nutrición</p>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Título de la Sesión*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Planificación de Dieta Personalizada" 
                      {...field} 
                    />
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
                  <FormLabel className="font-medium">Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalles sobre los temas a tratar en la sesión" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Fecha y Hora de Inicio*</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Fecha y Hora de Fin*</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="zoomLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Enlace de Zoom</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://zoom.us/j/..." 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxPatients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Máximo de Pacientes</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Estado de la Sesión</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="programada">Programada</SelectItem>
                        <SelectItem value="completada">Completada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Sección de Pacientes */}
        {currentUser.role !== "client" && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Pacientes</h2>
            <p className="text-gray-600 mb-6">Seleccione los pacientes que asistirán a esta sesión</p>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="patients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Pacientes</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={(value) => {
                          const patients = [...(field.value || [])];
                          if (!patients.includes(value)) {
                            patients.push(value);
                          }
                          field.onChange(patients);
                        }}
                      >
                        <SelectTrigger className="w-full mb-3">
                          <SelectValue placeholder="Seleccione un paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                    
                    {/* Lista de pacientes seleccionados */}
                    <div className="mt-3 space-y-2">
                      {field.value && field.value.length > 0 ? (
                        field.value.map(patientId => {
                          const client = clients.find(c => c.id === patientId);
                          return client ? (
                            <div key={patientId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>{client.name}</span>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  const patients = field.value?.filter(id => id !== patientId) || [];
                                  field.onChange(patients);
                                }}
                              >
                                Eliminar
                              </Button>
                            </div>
                          ) : null;
                        })
                      ) : (
                        <p className="text-gray-500 text-sm">No se han seleccionado pacientes</p>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading}>
            {mode === 'create' ? 'Crear' : 'Guardar'} Sesión
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/sesiones-nutricion')} disabled={isLoading}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NutritionSessionForm;
