import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Client, BodyMeasurement } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Esquema de validación
const bodyMeasurementSchema = z.object({
  clientId: z.string().min(1, { message: "Debe seleccionar un paciente" }),
  date: z.date({ required_error: "La fecha es requerida" }),
  
  // Medidas básicas
  weight: z.coerce.number().min(0, { message: "El peso debe ser un número positivo" }),
  height: z.coerce.number().min(0, { message: "La altura debe ser un número positivo" }),
  
  // Medidas corporales - opcionales
  chest: z.coerce.number().min(0).optional(),
  waist: z.coerce.number().min(0).optional(),
  hip: z.coerce.number().min(0).optional(),
  leftArm: z.coerce.number().min(0).optional(),
  rightArm: z.coerce.number().min(0).optional(),
  leftThigh: z.coerce.number().min(0).optional(),
  rightThigh: z.coerce.number().min(0).optional(),
  leftCalf: z.coerce.number().min(0).optional(),
  rightCalf: z.coerce.number().min(0).optional(),
  
  // Composición corporal - opcionales
  bodyFatPercentage: z.coerce.number().min(0).max(100).optional(),
  muscleMassPercentage: z.coerce.number().min(0).max(100).optional(),
  visceralFat: z.coerce.number().min(0).optional(),
  basalMetabolicRate: z.coerce.number().min(0).optional(),
  
  // Notas
  notes: z.string().optional(),
});

type BodyMeasurementFormValues = z.infer<typeof bodyMeasurementSchema>;

interface ClientProfile {
  name: string;
  email: string;
}

interface FormattedClient {
  id: string;
  name: string;
  email: string;
}

interface BodyMeasurementFormProps {
  onClose: () => void;
  initialData?: BodyMeasurement;
  clientId?: string;
}

export const BodyMeasurementForm = ({
  onClose,
  initialData,
  clientId,
}: BodyMeasurementFormProps) => {
  const { clients } = useData();
  const { currentUser } = useAuth();
  const {
    loading,
    error,
    addBodyMeasurement,
    updateBodyMeasurement
  } = useBodyMeasurements();
  const [formattedClients, setFormattedClients] = useState<FormattedClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isEdit = !!initialData;
  
  // Configurar el formulario con valores iniciales
  const form = useForm<BodyMeasurementFormValues>({
    resolver: zodResolver(bodyMeasurementSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          date: new Date(initialData.date),
        }
      : {
          clientId: clientId || "",
          date: new Date(),
          weight: 0,
          height: 0,
        },
  });
  
  // Calcular IMC cuando cambien peso y altura
  const weight = form.watch("weight");
  const height = form.watch("height");
  
  useEffect(() => {
    if (weight && height) {
      // Altura en metros para el cálculo de IMC
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      console.log(`Calculated BMI: ${bmi.toFixed(2)}`);
    }
  }, [weight, height]);
  
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
  }, []);
  
  const onSubmit = async (data: BodyMeasurementFormValues) => {
    try {
      // Obtener el ID del nutricionista
      const { data: nutritionistData, error: nutritionistError } = await supabase
        .from('nutritionists')
        .select('profile_id')
        .eq('profile_id', currentUser?.id)
        .single();

      if (nutritionistError) throw nutritionistError;
      if (!nutritionistData) throw new Error('No se encontró el nutricionista');

      // Calcular IMC
      const heightInMeters = data.height / 100;
      const bmi = data.weight / (heightInMeters * heightInMeters);

      // Crear objeto de medidas en formato JSONB
      const measurements = {
        bmi: parseFloat(bmi.toFixed(2)),
        weight: data.weight,
        height: data.height,
        chest: data.chest,
        waist: data.waist,
        hips: data.hip,
        arms: data.leftArm && data.rightArm ? (data.leftArm + data.rightArm) / 2 : undefined,
        thighs: data.leftThigh && data.rightThigh ? (data.leftThigh + data.rightThigh) / 2 : undefined,
        body_fat: data.bodyFatPercentage,
        muscle_mass: data.muscleMassPercentage
      };

      // Eliminar propiedades undefined del objeto measurements
      Object.keys(measurements).forEach(key => 
        measurements[key] === undefined && delete measurements[key]
      );

      const measurementData = {
        client_id: data.clientId,
        created_by: currentUser?.id,
        date: data.date.toISOString().split('T')[0],
        measurements: measurements,
        notes: data.notes
      };

      if (isEdit && initialData) {
        const { error: updateError } = await supabase
          .from('body_measurements')
          .update(measurementData)
          .eq('id', initialData.id);

        if (updateError) throw updateError;
        toast.success("Medida corporal actualizada correctamente");
      } else {
        const { error: insertError } = await supabase
          .from('body_measurements')
          .insert(measurementData);

        if (insertError) throw insertError;
        toast.success("Medida corporal guardada correctamente");
      }

      // Reiniciar el formulario
      form.reset({
        clientId: "",
        date: new Date(),
        weight: undefined,
        height: undefined,
        chest: undefined,
        waist: undefined,
        hip: undefined,
        leftArm: undefined,
        rightArm: undefined,
        leftThigh: undefined,
        rightThigh: undefined,
        leftCalf: undefined,
        rightCalf: undefined,
        bodyFatPercentage: undefined,
        muscleMassPercentage: undefined,
        visceralFat: undefined,
        basalMetabolicRate: undefined,
        notes: ""
      });

      onClose();
    } catch (error) {
      console.error('Error al guardar la medida:', error);
      toast.error("Error al guardar la medida corporal");
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selección de paciente */}
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!!clientId || isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoading ? "Cargando clientes..." : "Seleccione un paciente"} />
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

          {/* Fecha de medición */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Medición*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value ? "text-muted-foreground" : ""
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: es })
                        ) : (
                          <span>Seleccione una fecha</span>
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
        </div>

        {/* Medidas básicas */}
        <div>
          <h3 className="text-lg font-medium mb-2">Medidas Básicas</h3>
          <Separator className="mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Peso */}
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Peso (kg)*
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Altura */}
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Altura (cm)*
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* IMC (calculado) */}
            <FormItem>
              <FormLabel>
                IMC
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 ml-1 inline-block" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Índice de Masa Corporal</p>
                      <p>Se calcula automáticamente</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <Input
                type="text"
                value={weight && height ? (weight / ((height / 100) * (height / 100))).toFixed(2) : ""}
                disabled
              />
            </FormItem>
          </div>
        </div>

        {/* Medidas Corporales */}
        <div>
          <h3 className="text-lg font-medium mb-2">Medidas Corporales</h3>
          <Separator className="mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cuello */}
            <FormField
              control={form.control}
              name="chest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pecho (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Cintura */}
            <FormField
              control={form.control}
              name="waist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cintura (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Cadera */}
            <FormField
              control={form.control}
              name="hip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cadera (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Brazo Izq */}
            <FormField
              control={form.control}
              name="leftArm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bíceps Izq. (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Brazo Der */}
            <FormField
              control={form.control}
              name="rightArm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bíceps Der. (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Muslo Izq */}
            <FormField
              control={form.control}
              name="leftThigh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Muslo Izq. (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Muslo Der */}
            <FormField
              control={form.control}
              name="rightThigh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Muslo Der. (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Pantorrilla Izq */}
            <FormField
              control={form.control}
              name="leftCalf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pantorrilla Izq. (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Pantorrilla Der */}
            <FormField
              control={form.control}
              name="rightCalf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pantorrilla Der. (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Composición Corporal */}
        <div>
          <h3 className="text-lg font-medium mb-2">Composición Corporal</h3>
          <Separator className="mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* % Grasa Corporal */}
            <FormField
              control={form.control}
              name="bodyFatPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>% Grasa Corporal</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* % Masa Muscular */}
            <FormField
              control={form.control}
              name="muscleMassPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>% Masa Muscular</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Grasa Visceral */}
            <FormField
              control={form.control}
              name="visceralFat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grasa Visceral</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Tasa Metabólica Basal */}
            <FormField
              control={form.control}
              name="basalMetabolicRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tasa Metabólica Basal (kcal)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 ml-1 inline-block" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Calorías quemadas en reposo</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Notas */}
        <div>
          <h3 className="text-lg font-medium mb-2">Notas</h3>
          <Separator className="mb-4" />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas Adicionales</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Escribe aquí notas adicionales sobre las medidas"
                    className="h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Botones de formulario */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEdit ? "Actualizar" : "Crear"}
          </Button>
          {isEdit && (
            <Button type="button" variant="outline" onClick={onClose}>
              Crear y añadir otro
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

